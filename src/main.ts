import express from "express";
import dotenv from "dotenv";
import { RouteCreator } from "./routes/route-creator";
import { Requirements } from "./validation/validation-builder";
import { z } from "zod";

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
    const routeCreatorInstance = RouteCreator.getInstance();
    await routeCreatorInstance.createNewRoute("text", [
      {
        name: "text",
        required: true,
        type: "string",
        requirements: [
          {
            type: Requirements.MIN,
            value: 10,
          },
        ],
      },
    ]);
  });
}

main();
