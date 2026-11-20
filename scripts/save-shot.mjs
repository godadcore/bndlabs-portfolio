import { readFileSync, writeFileSync } from "node:fs";

const payload = JSON.parse(readFileSync(process.argv[2], "utf8"));
writeFileSync(process.argv[3], Buffer.from(payload.data, "base64"));
console.log(process.argv[3], Buffer.from(payload.data, "base64").length);
