console.clear();

const base = "http://localhost:3000";

const users = [
  { name: 'Henrique Barros', email: 'henrique.barros@exemplo.com' },
  { name: 'Carlos Souza', email: 'carlos_souza@exemplo.com' },
  { name: 'Márcia Martins', email: 'marcia_martins73@exemplo.com' },
  { name: 'Maria Júlia Franco', email: 'mariajulia_franco23@exemplo.com' },
  { name: 'Maitê Reis', email: 'maite.reis@exemplo.com' },
  { name: 'Maria Franco', email: 'maria_franco@exemplo.com' },
  { name: 'Alexandre Batista', email: 'alexandre.batista36@exemplo.com' },
  { name: 'Eduarda Carvalho', email: 'eduarda.carvalho52@exemplo.com' },
  { name: 'Ricardo Carvalho', email: 'ricardo.carvalho78@exemplo.com' },
  { name: 'Ana Júlia Reis', email: 'anajulia_reis81@exemplo.com' },
  { name: 'Rebeca Martins', email: 'rebeca.martins29@exemplo.com' },
  { name: 'Maria Helena Martins', email: 'mariahelena_martins@exemplo.com' },
  { name: 'Mércia Pereira', email: 'mercia_pereira@exemplo.com' },
  { name: 'João Pedro Barros', email: 'joaopedro.barros38@exemplo.com' },
  { name: 'Deneval Reis', email: 'deneval.reis@exemplo.com' },
  { name: 'Pablo Xavier', email: 'pablo.xavier@exemplo.com' },
  { name: 'Nataniel Silva', email: 'nataniel_silva@exemplo.com' },
  { name: 'Yango Xavier', email: 'yango.xavier37@exemplo.com' },
  { name: 'Eduardo Batista', email: 'eduardo.batista91@exemplo.com' },
  { name: 'Emanuel Santos', email: 'emanuel.santos66@exemplo.com' },
];

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
	async postUser(user) {
		const response = await fetch(base + "/auth/user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(user)
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
	},
	async postBig() {
		const response = await fetch(base + "/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				big: "a".repeat(3_000_000)
			},
			body: JSON.stringify("a".repeat(3_000_000))
		});
		const body = await response.json();
	}
};

// for(const user of users) {
// 	const [username, _] = user.email.split("@");
// 	const obj = {
// 		name: user.name,
// 		username,
// 		email: user.email,
// 		role: "user",
// 		password: "Az.12345678"
// 	};
// 	await functions.postUser(obj);
// 	await new Promise(resolve => setTimeout(resolve, 1500));
// }

functions[process.argv[2]]();