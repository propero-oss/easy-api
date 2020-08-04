import express, { Request, Response } from "express";
import { Get } from "src/decorator/http-method-decorators";
import { Mount } from "src/decorator/mount-decorator";
import { easyApi } from "src/easy-api";

@Mount("/json-service-example")
class JsonService {
  @Get("/echo/**")
  public async echo(req: Request, res: Response) {
    const { query, body, path, baseUrl, ip, hostname } = req;
    res.json({ query, body, path, baseUrl, ip, hostname });
  }
}

const app = express();
app.use("/api/v1", easyApi());

// eslint-disable-next-line no-console
app.listen(3000, () => console.log("http://localhost:3000/"));
