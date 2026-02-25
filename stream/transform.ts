import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const transform = new Transform({
  transform(chunk: Buffer, _encode, next) {
    const data = JSON.parse(chunk.toString());
    const filtered = data.filter((item: any) => item.lifetime === "true")
    this.push(JSON.stringify(filtered));
    next();
  }
});



await pipeline(createReadStream("./data.json"), transform, createWriteStream("./output-lifetime-data.json"));