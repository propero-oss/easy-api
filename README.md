# Easy API

[![Maintainability](https://api.codeclimate.com/v1/badges/d843b9fcb8d7fe37a6f5/maintainability)](https://codeclimate.com/github/propero-oss/easy-api/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d843b9fcb8d7fe37a6f5/test_coverage)](https://codeclimate.com/github/propero-oss/easy-api/test_coverage)
[![Build Status](https://app.travis-ci.com/propero-oss/easy-api.svg?branch=master)](https://app.travis-ci.com/propero-oss/easy-api)

## Installing
```shell
npm i @propero/easy-api
```
```shell
yarn add @propero/easy-api
```
```shell
pnpm add @propero/easy-api
```

## Documentation

###### In progress... maybe... hopefully... within the next decade or so... no guarantees though

## Examples

For further examples check out the [example directory](example).

##### Simple Hello World Service
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

##### Simple Custom Injection Decorator
```typescript
import express from "express";
import { createInjectorMiddleware, Post, Catch, CatchError } from "@propero/easy-api";
import { validateOrReject, ValidatorOptions, IsEmail } from "class-validator";
import { plainToClass } from "class-transformer";

const Validated = (Cls: unknown, validateOptions?: ValidatorOptions) => createInjectorMiddleware(() => async (req) => {
  const casted = plainToClass(Cls, req.body);
  await validateOrReject(casted, validateOptions);
  return casted;
});

class SubmitFormBody {
  @IsEmail()
  email: string;
}

@Service("/submit-form")
class SubmitFormService {
  @Post()
  public async onSubmit(@Validated(SubmitFormBody) body: SubmitFormBody) {
    console.log(body);
  }

  // Classes is set to array since class-validator does not throw an error but an array of errors
  @Catch({ status: 400, classes: Array })
  public async onError(@CatchError errors: ValidationError[]) {
    return { errors };
  }
}


const app = express();
app.use(createService(new SubmitFormService()));
app.listen(3000, () => console.log("http://localhost:3000/"));
```
