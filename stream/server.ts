import { createReadStream, createWriteStream } from "node:fs";
import { createServer } from "node:http";
import { pipeline } from "node:stream/promises";

const log = createWriteStream("./log.txt", { flags: "a" });

const server = createServer(async (req, res) => {
  try {
    const data = createReadStream("./data.json");
    log.write(`${ req.method } ${ req.socket.remoteAddress } \n`);
    await pipeline(data, res);
  } catch(error) {
    res.statusCode = 500;
    res.end("Error!");
  }
});

server.listen(4000).on("close", () => {
  log.end();
});