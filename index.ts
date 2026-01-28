import { readFile } from "node:fs/promises";
import { AuthApi } from "./api/auth/index.ts";
import { LmsApi } from "./api/lms/index.ts";
import { Core } from "./core/core.ts";
import { logger } from "./core/middlewares/logger.ts";
import { RouteError } from "./core/utils/route-error.ts";

const core = new Core();

core.router.use([logger]);

new AuthApi(core).init();
new LmsApi(core).init();

core.router.get("/", async (req, res) => {
  const index = await readFile("./web/index.html", "utf-8");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).end(index);
});

core.router.get("/seguro", async (req, res) => {
  const id = req.headers.cookie?.match(/sid=(\d+)/)?.[1];
  if(!id) {
    throw new RouteError(401, "Não autenticado!")
  }
  const user = core.db.query(/*sql*/`
    SELECT "email", "name" FROM "users" WHERE "id" = ?
  `).get(id);
  if(!user) {
    throw new RouteError(404, "Usuário não encontrado!");
  }
  console.log(user);
  res.status(200).json(user);
});

core.init();