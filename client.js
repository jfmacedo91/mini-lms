console.clear();

const base = "http://localhost:3000";

const functions = {
	async postCourse() {
		const response = await fetch(base + "/lms/courses", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(courses.html)
		});
		const body = await response.json();
		console.table(body);
	},
	async postLesson(lesson) {
		const response = await fetch(base + "/lms/lessons", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(lesson)
		});
		const body = await response.json();
		console.table(body);
	}
};

functions[process.argv[2]]();