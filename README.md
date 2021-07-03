# OpenAPI to msw

Converstion tool from OpenAPI to msw

from: `openapi.yml`

```
openapi: 3.0.3
info:
  title: ""
  version: 0.0.0
paths:
  /hoge/:
    get:
      description: "hoge"
      responses:
        "200":
          description: No response body
  /fuga/:
    post:
      description: hasValue
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/testobj"
          application/x-www-form-urlencoded:
            schema:
              $ref: "#/components/schemas/testobj"
          multipart/form-data:
            schema:
              $ref: "#/components/schemas/testobj"
        required: true
      responses:
        "201":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/testobj"
          description: ""
components:
  schemas:
    testobj:
      type: object
      properties:
        id:
          type: string
        text:
          type: string
        number:
          type: integer
        bool:
          type: boolean
      required:
        - id
        - text
```

to: `msw.ts`

```
import { rest } from 'msw'

export const handlers = [
  rest.get('/hoge/', null),
  rest.post('/fuga/', {"id":"string","text":"string","number":1,"bool":true})
]
```

## Development

```
npm install
npm run dev
```
