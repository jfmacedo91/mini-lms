console.clear();

const base = "http://localhost:3000";

const functions = {
	async postCourse() {
		const response = await fetch(base + "/lms/course", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				slug: "html-e-css",
				title: "HTML e CSS",
				description: "Curso de HTML e CSS para Iniciantes",
				lessons: 40,
				hours: 10,
			})
		});
		const body = await response.json();
		console.table(body);
	},
	async postLesson() {
		const response = await fetch(base + "/lms/lesson", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				courseSlug: "html-e-css",
				slug: "tags-basicas",
				title: "Tags Básicas",
				seconds: 200,
				video: "/html/tags-basicas.mp4",
				description: "Aula sobre as Tags Básicas",
				order: 1,
				free: 1,
			})
		});
		const body = await response.json();
		console.table(body);
	},
	async getCourses() {
		const response = await fetch(base + "/lms/courses");
		const body = await response.json();
		console.log(body);
	},
	async getCourse() {
		const response = await fetch(base + "/lms/course/javascript-completo");
		const body = await response.json();
		console.log(body);
	},
	async getLesson() {
		const response = await fetch(base + "/lms/lesson/html-e-css/estrutura-do-documento");
		const body = await response.json();
		console.log(body);
	},
	async postUser() {
		const response = await fetch(base + "/auth/user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name: "Jean Fernandes de Macedo",
				username: "jeanmacedo",
				email: "jean@email.com",
				role: "admin",
				password: "123456"
			})
		});
		const body = await response.json();
		console.table(body);
	},
	async postLessonCompleted() {
		const response = await fetch(base + "/lms/lesson/complete", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ courseId: process.argv[3], lessonId: process.argv[4] })
		});
		const body = await response.json();
		console.table(body);
	},
	async resetCourse() {
		const response = await fetch(base + "/lms/course/reset", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ courseId: 1 })
		});
		const body = await response.json();
		console.table(body);
	},
	async getCertificates() {
		const response = await fetch(base + "/lms/certificates");
		const body = await response.json();
		console.log(body);
	},
	async getCertificate() {
		const response = await fetch(base + "/lms/certificate/" + process.argv[3]);
		const body = await response.json();
		console.log(body);
	}
};

functions[process.argv[2]]();