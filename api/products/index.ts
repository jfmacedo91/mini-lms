import { Api } from "../../core/utils/abstract.ts";
import { RouteError } from "../../core/utils/route-error.ts";

export class ProductsApi extends Api {
  handlers = {
    getHome: (req, res) => {
      res.status(200).end("Hello World");
    },
    getCourse: (req, res) => {
      const { slug } = req.params;
      const courses = ["javascript", "php", "python"];
      const course = courses.includes(slug);
      if(!course) {
        throw new RouteError(404, "Curso não encontrado!");
      }
    
      res.status(200).json(slug);
    },
    getProduct: (req, res) => {
      const { slug } = req.params;
      const product = this.db.query(/*sql*/`SELECT * FROM "products" WHERE "slug" = ?`).get(slug);
      if(!product) {
        throw new RouteError(404, "Produto não encontrado!");
      }
    
      res.status(200).json(product);
    }
  } satisfies Api["handlers"];
  tables(): void {
    this.db.exec(/*sql*/`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" INTEGER PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE
      );

      INSERT OR IGNORE INTO "products"
        ("slug", "name")
      VALUES
        ('notebook', 'Notebook');
    `);
  };
  routes(): void {
    this.router.get("/", this.handlers.getHome);
    this.router.get("/curso/:slug", this.handlers.getCourse);
    this.router.get("/products/:slug", this.handlers.getProduct);
  }
}