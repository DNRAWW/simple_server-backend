import express from "express";
import dotenv from "dotenv";
import { RouteCreator } from "./routes/route-creator";

dotenv.config({
  path: ".env",
  debug: true,
});

function main() {
  const app = express();
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.listen(process.env.PORT, async () => {
    console.log("Server is listening at http:/localhost:" + process.env.PORT);

    RouteCreator.setInstance(app);
    const routeCreatorInstance = RouteCreator.getInstance();
    await routeCreatorInstance.createNewRoute("text", [
      {
        name: "text",
        required: true,
        type: "string",
      },
    ]);
  });
}

main();
