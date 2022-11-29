import { TableCreator } from "./table-creator";
import { TableDescriptionCreator } from "./table-description-creator";

export async function createTable(
  tableName: string,
  fields: {
    name: string;
    type: "string" | "number";
    required: boolean;
  }[]
) {
  if (tableName.trim().length < 2) {
    throw Error("Can't create a table with name less than 2 chars");
  }

  const tableDescriptionCreator = new TableDescriptionCreator();

  tableDescriptionCreator.setName(tableName);

  for (const field of fields) {
    tableDescriptionCreator.addField(field.name, field.type, field.required);
  }

  const tableDescription = tableDescriptionCreator.getResult();

  await new TableCreator().createTable(tableDescription);
}
