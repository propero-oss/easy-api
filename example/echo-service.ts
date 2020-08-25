import { Mount } from "example/app-init";
import { Request } from "express";
import { Use, Service } from "src/index";

@Mount("/echo")
@Service()
class EchoService {
  @Use()
  public async echo(req: Request) {
    const { query, body, path, originalUrl: url, baseUrl, protocol, cookies, ip, hostname, headers } = req;
    return { path, url, baseUrl, protocol, cookies, ip, hostname, headers, query, body };
  }
}
