import { app } from "example/app-init";
import "example/echo-service";
import "example/hello-service";

app.listen(3000, () => console.log("http://localhost:3000"));
