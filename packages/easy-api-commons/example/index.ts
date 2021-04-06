import { app, initialized } from "example/app-init";
import "example/hello-service";

(async () => {
  const statistics = await initialized();
  console.log(statistics);
  app.listen(3333, () => console.log("http://localhost:3333"));
})();
