import { Mount } from "example/app-init";
import { Catch, CatchError, Get, Query, Service } from "src/decorator";

class FooError extends Error {}
class BarError extends Error {}

@Mount("/hello")
@Service()
class HelloService {
  @Get()
  public async hello(@Query("name") name: string = "World", @Query("greet") greet: string = "Hello") {
    if (name === "foo") throw new FooError();
    if (name === "bar") throw new BarError();
    return `${greet} ${name}!`;
  }

  @Catch({ classes: FooError, status: 404 })
  public async onFooError(@CatchError error: FooError) {
    return "Foo not found!";
  }

  @Catch({ status: 400 })
  public async onError(@CatchError error: Error) {
    return "Bad Request";
  }
}
