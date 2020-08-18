import express, { Request } from "express";
import { Use } from "src/decorator/http-method-decorators";
import { Service } from "src/decorator/service-decorator";
import { createService } from "src/util/create-service";

@Service()
class EchoService {
  @Use("/echo")
  public async echo(req: Request) {
    const { query, body, path, originalUrl: url, baseUrl, protocol, cookies, ip, hostname, headers } = req;
    return { path, url, baseUrl, protocol, cookies, ip, hostname, headers, query, body };
  }
}

const app = express();
app.use("/api/v1", createService(new EchoService()));

app.listen(3000, () => console.log("http://localhost:3000/api/v1/"));
