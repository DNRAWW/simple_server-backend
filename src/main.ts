import express from "express";
import dotenv from "dotenv";
import { RouteCreator } from "./route-creator";

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

  app.listen(process.env.PORT, () => {
    console.log("Server is listening at http:/localhost:" + process.env.PORT);
    RouteCreator.setInstance(app);
  });
}

main();
