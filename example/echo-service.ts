import { Mount } from "example/app-init";
import { Request } from "express";
import { All, Service } from "src/index";

@Mount("/echo")
@Service()
class EchoService {
  @All("*", { accept: "text/html", responseType: "raw" })
  public async echoHtml(req: Request) {
    const { query, body, path, originalUrl: url, baseUrl, protocol, cookies, ip, hostname, headers } = req;
    return `<pre>${JSON.stringify({ path, url, baseUrl, protocol, cookies, ip, hostname, headers, query, body }, undefined, 2)}</pre>`;
  }

  @All("*", { accept: "application/json", responseType: "json" })
  public async echoJson(req: Request) {
    console.log("WHY AM I CALLED??????????");
    const { query, body, path, originalUrl: url, baseUrl, protocol, cookies, ip, hostname, headers } = req;
    return { path, url, baseUrl, protocol, cookies, ip, hostname, headers, query, body };
  }
}
