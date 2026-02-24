import { createReadStream } from "node:fs";

async function readStream() {
  const file = createReadStream("./data.json");
  // const data = await file.toArray();
  const chunks = [];
  for await (const chunk of file) {
    chunks.push(chunk);
  }
  const data = Buffer.concat(chunks);
  console.log(JSON.parse(data.toString()));
};

readStream();