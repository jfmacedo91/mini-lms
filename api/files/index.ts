import path from "node:path";
import { Api } from "../../core/utils/abstract.ts";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { validate } from "../../core/utils/validate.ts";
import { checkETag, mimeType } from "./utils.ts";
import { stat } from "node:fs/promises";
import { RouteError } from "../../core/utils/route-error.ts";

export class FilesApi extends Api {
  handlers = {
    sendFile: async (req, res) => {
      const name = validate.file(req.params.name);
      const filePath = `./files/${ name }`;
      const ext = path.extname(name);
      let info;
      try {
        info = await stat(filePath);
      } catch(error) {
        throw new RouteError(404, "Arquivo não encontrado!");
      };
      const etag = `W/${ info.size.toString(16) }=${ Math.floor(info.mtimeMs).toString(16) }`
      res.setHeader("ETag", etag);
      res.setHeader("Content-Length", info.size);
      res.setHeader("Last-Modified", info.mtime.toUTCString());
      res.setHeader("Content-Type", mimeType[ext] || "application/octet-stream");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      if(checkETag(req.headers["if-none-match"], etag)) {
        res.status(304);
        res.end();
        return;
      };
      res.status(200);
      const file = createReadStream(filePath);
      await pipeline(file, res);
    }
  } satisfies Api["handlers"];
  routes(): void {
    this.router.get("/files/:name", this.handlers.sendFile);
  };
};