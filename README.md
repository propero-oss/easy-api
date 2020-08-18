# Easy API

[![Maintainability](https://api.codeclimate.com/v1/badges/d843b9fcb8d7fe37a6f5/maintainability)](https://codeclimate.com/github/propero-oss/easy-api/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d843b9fcb8d7fe37a6f5/test_coverage)](https://codeclimate.com/github/propero-oss/easy-api/test_coverage)


```shell
npm i @propero/easy-api
# Or with yarn
yarn add @propero/easy-api
```

## Documentation

###### In progress... maybe... hopefully... within the next decade or so... no guarantees though

## Examples

For further examples check out the [example directory](example).

```typescript
import express from "express";
import { Service, createService, Get, Param } from "@propero/easy-api";

@Service("/hello")
class HelloService {
  @Get("/:name?")
  public async hello(@Param("name") name: string = "world") {
    return `Hello ${name}!`;
  }
}

const app = express();
app.use("/api/v1", createService(new HelloService()));
app.listen(3000, () => console.log("http://localhost:3000/api/v1/hello"));
```
