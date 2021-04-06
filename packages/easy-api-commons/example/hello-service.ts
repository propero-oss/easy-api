import { Mount } from "example/app-init";
import { Get, Query, Service } from "@propero/easy-api";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Mount("/hello", sleep(2000))
@Service()
class HelloService {
  @Get()
  public async hello(@Query("name") name: string = "World", @Query("greet") greet: string = "Hello") {
    return `${greet} ${name}!`;
  }
}
