import { Knex } from "knex";
import { db } from "./db-connection";
import { TTableDescription } from "./table-description-creator";

export class TableCreator {
  private dbConnection: Knex;

  constructor() {
    this.dbConnection = db;
  }

  async createTable(tableDescription: TTableDescription) {
    await this.dbConnection.schema
      .withSchema("public")
      .createTable(tableDescription.name, (table) => {
        const DataTypes = {
          string: (name: string, length?: number) => table.string(name, length),
          number: (name: string, length?: number) =>
            table.integer(name, length),
        };

        table.increments();

        for (const field of tableDescription.fields) {
          const newField = DataTypes[field.type](field.name);
          if (field.required) {
            newField.notNullable();
          } else {
            newField.nullable();
          }
        }
      });
  }
}
