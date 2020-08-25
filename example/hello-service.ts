import { Mount } from "example/app-init";
import { Get, Query, Service } from "src/decorator";

@Mount("/hello")
@Service()
class HelloService {
  @Get()
  public async hello(@Query("name") name: string = "World", @Query("greet") greet: string = "Hello") {
    return `${greet} ${name}!`;
  }
}
