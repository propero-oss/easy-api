import { Mount } from "example/app-init";
import { Request } from "express";
import { All, createRequestInjector, Req, Service } from "src/index";

const This = createRequestInjector(() => (req, res, next, cxt) => cxt);

@Mount("/echo")
@Service()
class EchoService {
  @All("*", { accept: "text/html", responseType: "raw" })
  public async echoHtml(@Req req: Request, @This context: any) {
    const { query, body, path, originalUrl: url, baseUrl, protocol, cookies, ip, hostname, headers } = req;
    return `<h1>Echo Service!</h1><pre>${JSON.stringify(
      { path, url, baseUrl, protocol, cookies, ip, hostname, headers, query, body, context },
      undefined,
      2
    )}</pre>`;
  }

  @All("*", { accept: "application/json", responseType: "json" })
  public async echoJson(@Req req: Request, @This context: any) {
    const { query, body, path, originalUrl: url, baseUrl, protocol, cookies, ip, hostname, headers } = req;
    return { path, url, baseUrl, protocol, cookies, ip, hostname, headers, query, body, context };
  }
}
