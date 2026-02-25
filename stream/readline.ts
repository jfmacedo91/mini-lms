import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline/promises";

const read = createReadStream("./data.ndjson");
const write = createWriteStream("./output-lifetime-data.ndjson");

const lines = createInterface({ input: read, crlfDelay: Infinity })

for await(const line of lines) {
  const obj = JSON.parse(line);
  if(obj.lifetime === "true") write.write(line + "\n");
};

write.end();