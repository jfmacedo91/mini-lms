import { readFile } from "node:fs/promises";
import { AuthApi } from "./api/auth/index.ts";
import { LmsApi } from "./api/lms/index.ts";
import { Core } from "./core/core.ts";
import { logger } from "./core/middlewares/logger.ts";
import { RouteError } from "./core/utils/route-error.ts";
import { sha256 } from "./api/auth/utils.ts";

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
  const sid = req.headers.cookie?.replace("sid=", "");
  if(!sid) {
    throw new RouteError(401, "Não autenticado!")
  }
  const sid_hash = sha256(sid);
  const session = core.db.query(/*sql*/`
    SELECT "user_id" FROM "sessions" WHERE "sid_hash" = ?
  `).get(sid_hash);
  if(!session) {
    throw new RouteError(404, "Usuário não encontrado!");
  }
  res.status(200).json(session);
});

core.init();