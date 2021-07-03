import { load } from "js-yaml";
import { readFileSync } from "fs";

type Responses = { [key: string]: any };

type METHODS = "get" | "post" | "put" | "delete";

type Components = {
  schemas: any;
};

type ObjectType = "array" | "object" | "integer" | "string" | "boolean";

type OpenAPIObject = {
  type: ObjectType;
  items?: any;
  properties: { [key: string]: { type: ObjectType } };
};

type OpenAPI = {
  openapi: string;
  info: { title: string; version: string };
  paths: {
    [key: string]: {
      [key in METHODS]: {
        description: string;
        responses: Responses;
      };
    };
  };
  components: Components;
};

function findSuccessResponseKey(responses: Responses) {
  return Object.keys(responses).find((key) => key.startsWith("2"));
}

function openapiObjToObject(openapiObj: OpenAPIObject, components: Components) {
  const copy: any = { ...openapiObj.properties };
  if (openapiObj.type === "object") {
    Object.keys(openapiObj.properties).map((key) => {
      switch (openapiObj.properties[key].type) {
        case "string":
          copy[key] = "string";
          return;
        case "integer":
          copy[key] = 1;
          return;
        case "boolean":
          copy[key] = true;
          return;
        case "object":
          copy[key] = openapiObjToObject(copy[key], components);
          return;
        case "array":
          copy[key] = openapiObjToObject(copy[key], components);
          return;
        default:
          copy[key] = null;
      }
    });
    return copy;
  }
  if (openapiObj.type === "array") {
    const obj: any = openapiObjToObject(
      getComponentObj(openapiObj.items["$ref"], components.schemas),
      components
    );
    return [obj];
  }
  if (openapiObj.type === "string") {
    return "string";
  }

  if (openapiObj.type === "integer") {
    return 1;
  }
  return "";
}

function getComponentObj(path: string, schemas: Components["schemas"]) {
  // remove first 2 elements since it's "#/components/schema"
  const componentsPaths = path.split("/").slice(3);
  let componentValue = schemas;
  componentsPaths.forEach((path) => {
    componentValue = componentValue[path];
  });
  return componentValue;
}

function getSchemaFromResponse(response: any, components: Components) {
  if (
    response.content &&
    response.content["application/json"] &&
    response.content["application/json"].schema
  ) {
    const values = response.content["application/json"].schema;

    if ("$ref" in values) {
      return openapiObjToObject(
        getComponentObj(values["$ref"] as string, components.schemas),
        components
      );
    }
    return values;
  }

  return null;
}

function generate(_doc: OpenAPI) {
  let mswString = `import { rest } from 'msw'

export const handlers = [
`;

  const paths: any = [];
  Object.keys(_doc.paths).forEach((path) => {
    const value = _doc.paths[path];
    (["get", "post", "put", "delete"] as METHODS[]).forEach((method) => {
      if (value[method]) {
        const successResponseKey = findSuccessResponseKey(
          value[method].responses
        );
        paths.push(
          `  rest.${method}('${path}', ${
            successResponseKey
              ? JSON.stringify(
                  getSchemaFromResponse(
                    value[method].responses[successResponseKey],
                    doc.components
                  )
                )
              : null
          })`
        );
      }
    });
  });
  mswString += paths.join(",\n");
  mswString += "\n]";

  console.log(mswString);
}

const doc = load(readFileSync("./test-openapi.yml", "utf8")) as OpenAPI;
generate(doc);
