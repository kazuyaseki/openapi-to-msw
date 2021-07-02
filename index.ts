import { load } from "js-yaml";
import { readFileSync } from "fs";

function generate(json: any) {
  console.log(json);
}

const doc = load(readFileSync("./test-openapi.yml", "utf8"));
generate(doc);
