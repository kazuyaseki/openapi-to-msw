import { load } from "js-yaml";
import { readFileSync } from "fs";

type Response = {};

type OpenAPI = {
  openapi: string;
  info: { title: string; version: string };
  paths: {
    [key: string]: {
      [key in "get" | "post" | "put" | "delete"]: {
        description: string;
        responses: { [key: string]: any };
      };
    };
  };
  components: {
    schemas: any;
  };
};

function generate(doc: OpenAPI) {
  Object.values(doc.paths).forEach((value) => {
    console.log(value);
  });
}

const doc = load(readFileSync("./test-openapi.yml", "utf8")) as OpenAPI;
generate(doc);
