import z from "zod";
import { Express } from "express";
import * as uuid from "uuid";
import { paramTypes, TParamsShape, TRouteParam } from "./validation-builder";

export class RouteCreator {
  private appInstance: Express;
  static routeCreaterInstance: RouteCreator;

  constructor() {}

  private setAppInstance(app: Express) {
    this.appInstance = app;
  }

  static setInstance(app: Express) {
    this.routeCreaterInstance = new RouteCreator();
    this.routeCreaterInstance.setAppInstance(app);

    console.log("Route creator initialized!");
  }

  static getInstance() {
    if (!this.routeCreaterInstance) {
      throw Error("Route creater class is not initialized");
    }

    return this.routeCreaterInstance;
  }

  createNewRoute(params: TRouteParam[]) {
    // TODO: CORS

    const paramsShape: TParamsShape = {};

    for (const param of params) {
      paramsShape[param.name] = paramTypes[param.type]();
    }

    const validation = z.object({
      ...paramsShape,
    });

    let needValidation = false;

    if (params.length > 0) {
      needValidation = true;
    }

    const pathUUID = uuid.v4();

    // TODO: /user-routes/* and get data from db
    // maybe slower but less memory used
    // + in case of server restart we don't have to initialize anything

    this.appInstance.post(`/user-routes/${pathUUID}`, (req, res) => {
      let validatedData: unknown = {};

      if (needValidation) {
        try {
          validatedData = validation.parse(req.body);
        } catch (e) {
          if (e instanceof z.ZodError) {
            res
              .status(400)
              .send({ type: "Validation error", errors: e.errors });
            return;
          }

          res.status(500).send("Server error");
          return;
        }
      }

      console.log(validatedData);
      res.send("Success");
    });

    console.log(
      "Created a route at http://localhost:" + process.env.PORT + "/" + pathUUID
    );

    // TODO: save data to table
  }
}
