import { Api } from "../../core/utils/abstract.ts";
import { RouteError } from "../../core/utils/route-error.ts";
import { LmsQuery } from "./query.ts";
import { lmsTables } from "./tables.ts";

export class LmsApi extends Api {
  query = new LmsQuery(this.db);
  handlers = {
    postCourse: (req, res) => {
      const { slug, title, description, lessons, hours } = req.body;
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
      const { courseSlug, slug, title, seconds, video, description, order, free } = req.body;
      const writeResult = this.db.query(/*sql*/`
        INSERT OR IGNORE INTO "lessons"
          ("course_id", "slug", "title", "seconds", "video", "description", "order", "free")
        VALUES
          ((SELECT "id" FROM "courses" WHERE "slug" = ?), ?, ?, ?, ?, ?, ?, ?);
      `).run(courseSlug, slug, title, seconds, video, description, order, free);
      if(writeResult.changes === 0) {
        throw new RouteError(400, "Erro ao criar aula!");
      }

      res.status(201).json({
        id: writeResult.lastInsertRowid,
        changes: writeResult.changes,
        title: "Aula criada com sucesso!"
      });
    }
  } satisfies Api["handlers"];
  tables(): void {
    this.db.exec(lmsTables);
  };
  routes(): void {
    this.router.post("/lms/course", this.handlers.postCourse);
    this.router.post("/lms/lesson", this.handlers.postLesson);
  }
}