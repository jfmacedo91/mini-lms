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
			body: JSON.stringify( {
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
	}
};

functions[process.argv[2]]();