import z from "zod";
import { Express } from "express";
import * as uuid from "uuid";
import {
  paramTypes,
  TParamsShape,
  TRouteParam,
} from "../validation/validation-builder";
import { TableDescriptionCreator } from "../DB/table-description-creator";
import { TableCreator } from "../DB/table-creator";
import { Knex } from "knex";
import { db } from "../DB/db-connection";

export class RouteCreator {
  private appInstance: Express;
  static routeCreatorInstance: RouteCreator;
  private dbConnection: Knex;

  constructor() {}

  private setAppInstance(app: Express) {
    this.appInstance = app;
    this.dbConnection = db;
  }

  static setInstance(app: Express) {
    this.routeCreatorInstance = new RouteCreator();
    this.routeCreatorInstance.setAppInstance(app);

    console.log("Route creator initialized!");
  }

  static getInstance() {
    if (!this.routeCreatorInstance) {
      throw Error("Route creater class is not initialized");
    }

    return this.routeCreatorInstance;
  }

  async createNewRoute(tableName: string, params: TRouteParam[]) {
    // TODO: CORS

    const paramsShape: TParamsShape = {};

    for (const param of params) {
      paramsShape[param.name] = paramTypes[param.type]();
    }

    const validation = z.object({
      ...paramsShape,
    });

    if (params.length < 1) {
      throw Error("Can't have 0 params");
    }

    // TODO: Move db stuff somewhere else

    if (tableName.trim().length < 2) {
      throw Error("Can't create a table with name less than 4 chars");
    }

    const tableDescriptionCreator = new TableDescriptionCreator();

    tableDescriptionCreator.setName(tableName);

    for (const param of params) {
      tableDescriptionCreator.addField(param.name, param.type, param.required);
    }

    const tableDescription = tableDescriptionCreator.getResult();

    await new TableCreator().createTable(tableDescription);

    // End of db stuff

    const pathUUID = uuid.v4();

    // TODO: /user-routes/* and get data from db
    // maybe slower but less memory used
    // + in case of server restart we don't have to initialize anything

    this.appInstance.post(`/user-routes/${pathUUID}`, async (req, res) => {
      let validatedData: unknown = {};

      try {
        validatedData = validation.parse(req.body);
      } catch (e) {
        if (e instanceof z.ZodError) {
          res.status(400).send({ type: "Validation error", errors: e.errors });
          return;
        }

        res.status(500).send("Server error");
        return;
      }

      await this.dbConnection(tableName).insert(validatedData);

      res.send("Success");
    });

    this.appInstance.get(`/user-routes/${pathUUID}`, async (req, res) => {
      const result = await this.dbConnection(tableName);

      res.send(result);
    });

    console.log(
      "Created a routes at http://localhost:" +
        process.env.PORT +
        "/user-routes/" +
        pathUUID
    );

    // TODO: save data to table
  }
}
