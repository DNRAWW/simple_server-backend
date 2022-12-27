import express from "express";
import dotenv from "dotenv";
import { RouteCreator } from "./routes/route-creator";
import { Requirements } from "./validation/validation-builder";
import { initRoutes } from "./routes/routes";

dotenv.config({
  path: ".env",
  debug: true,
});

// TODO: Rate limiter

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

    initRoutes(app);
  });
}

main();
