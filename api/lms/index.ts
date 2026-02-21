import { Api } from "../../core/utils/abstract.ts";
import { RouteError } from "../../core/utils/route-error.ts";
import { validate } from "../../core/utils/validate.ts";
import { AuthMiddleware } from "../auth/middlewares/auth.ts";
import { LmsQuery } from "./query.ts";
import { lmsTables } from "./tables.ts";

export class LmsApi extends Api {
  query = new LmsQuery(this.db);
  auth = new AuthMiddleware(this.core);
  handlers = {
    postCourse: (req, res) => {
      if(!req.session) {
        throw new RouteError(401, "Não autorizado!")
      };

      const { slug, title, description, lessons, hours } = {
        slug: validate.string(req.body.slug),
        title: validate.string(req.body.title),
        description: validate.string(req.body.description),
        lessons: validate.number(req.body.lessons),
        hours: validate.number(req.body.hours)
      };
      const writeResult = this.query.insertCourse({ slug, title, description, lessons, hours })
      if(writeResult.changes === 0) {
        throw new RouteError(400, "Erro ao criar curso!");
      }

      res.status(201).json({
        id: writeResult.lastInsertRowid,
        changes: writeResult.changes,
        title: "Curso criado com sucesso!"
      });
    },
    postLesson: (req, res) => {
      if(!req.session) {
        throw new RouteError(401, "Não autorizado!")
      };

      const { courseSlug, slug, title, seconds, video, description, order, free } = {
        courseSlug: validate.string(req.body.courseSlug),
        slug: validate.string(req.body.slug),
        title: validate.string(req.body.title),
        seconds: validate.number(req.body.seconds),
        video: validate.string(req.body.video),
        description: validate.string(req.body.description),
        order: validate.number(req.body.order),
        free: validate.number(req.body.free),
      };
      const writeResult = this.query.insertLesson({ courseSlug, slug, title, seconds, video, description, order, free })
      if(writeResult.changes === 0) {
        throw new RouteError(400, "Erro ao criar aula!");
      }

      res.status(201).json({
        id: writeResult.lastInsertRowid,
        changes: writeResult.changes,
        title: "Aula criada com sucesso!"
      });
    },
    postLessonCompleted: (req, res) => {
      if(!req.session) {
        throw new RouteError(401, "Não autorizado!")
      };

      const { courseId, lessonId } = {
        courseId: validate.number(req.body.courseId),
        lessonId: validate.number(req.body.lessonId)
      };

      const writeResult = this.query.insertLessonCompleted(req.session.user_id, courseId, lessonId);
      if(writeResult.changes === 0) {
        throw new RouteError(400, "Erro ao completar aula!");
      };

      const progress = this.query.selectProgress(req.session.user_id, courseId);
      const incompleteLessons = progress.filter((item) => !item.completed);
      if(progress.length > 0 && incompleteLessons.length === 0) {
        const certificate = this.query.insertCertificate(req.session.user_id, courseId);
        if(!certificate) {
          throw new RouteError(400, "Erro gerar certificado!");
        };

        res.status(201).json({ certificate: certificate.id, title: "Aula concluída!" });
        return;
      };

      res.status(201).json({ certificate: "", title: "Aula concluída!" });
    },
    getCourses: (req, res) => {
      const courses = this.query.selectCourses();
      if(courses.length === 0) {
        throw new RouteError(404, "Nenhum curso encontrado!");
      };
      res.status(200).json(courses);
    },
    getCourse: (req, res) => {
      const { slug } = req.params;
      const course = this.query.selectCourse(slug);
      const lessons = this.query.selectLessons(slug);
      if(!course) {
        throw new RouteError(404, "Curso não encontrado!");
      }

      let completed: { lesson_id: number, completed: string }[] = [];
      if(req.session) {
        completed = this.query.selectLessonsCompleted(req.session.user_id, course.id);
      };

      res.status(200).json({ course, lessons, completed });
    },
    getLesson: (req, res) => {
      const { courseSlug, lessonSlug } = req.params;
      const lesson = this.query.selectLesson(courseSlug, lessonSlug);
      const nav = this.query.selectLessonNav(courseSlug, lessonSlug);
      if(!lesson) {
        throw new RouteError(404, "Aula não encontrada!");
      }
      const index = nav.findIndex(currentLesson => currentLesson.slug === lesson.slug);
      const prev = index === 0 ? null : nav.at(index - 1)?.slug;
      const next = nav.at(index + 1)?.slug ?? null;

      let completed = "";
      if(req.session) {
        const lessonCompleted = this.query.selectLessonCompleted(req.session.user_id, lesson.id);
        if(lessonCompleted) completed = lessonCompleted.completed;
      };

      res.status(200).json({ ...lesson, prev, next, completed });
    },
    resetCourse: (req, res) => {
      if(!req.session) {
        throw new RouteError(401, "Não autorizado!")
      };

      const courseId = validate.number(req.body.courseId);
      const writeResult = this.query.deleteLessonsCompleted(req.session.user_id, courseId);
      if(writeResult.changes === 0) {
        throw new RouteError(400, "Erro ao resetar o curso!");
      };

      res.status(200).json({ ttile: "Curso resetado com sucesso!" });
    },
    getCertificates: (req, res) => {
      if(!req.session) {
        throw new RouteError(401, "Não autorizado!")
      };

      const certificates = this.query.selectCertificates(req.session.user_id);
      if(certificates.length === 0) {
        throw new RouteError(400, "Nenhum certificado encontrado!");
      };

      res.status(200).json(certificates);
    },
    getCertificate: (req, res) => {
      const { certificateId } = req.params;
      const certificate = this.query.selectCertificate(certificateId);
      if(!certificate) {
        throw new RouteError(400, "Certificado não encontrado!");
      };

      res.status(200).json(certificate);
    }
  } satisfies Api["handlers"];
  tables(): void {
    this.db.exec(lmsTables);
  };
  routes(): void {
    this.router.post("/lms/course", this.handlers.postCourse, [this.auth.guard("admin")]);
    this.router.post("/lms/lesson", this.handlers.postLesson, [this.auth.guard("admin")]);
    this.router.post("/lms/lesson/complete", this.handlers.postLessonCompleted, [this.auth.guard("user")]);

    this.router.get("/lms/courses", this.handlers.getCourses);
    this.router.get("/lms/course/:slug", this.handlers.getCourse, [this.auth.optional]);
    this.router.get("/lms/lesson/:courseSlug/:lessonSlug", this.handlers.getLesson, [this.auth.optional]);
    this.router.get("/lms/certificates", this.handlers.getCertificates, [this.auth.guard("user")]);
    this.router.get("/lms/certificate/:certificateId", this.handlers.getCertificate);

    this.router.delete("/lms/course/reset", this.handlers.resetCourse, [this.auth.guard("user")]);
  }
}