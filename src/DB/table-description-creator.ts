type TTableField = {
  name: string;
  type: "string" | "number"; // In the future more
  required: boolean;
};

export type TTableDescription = {
  name: string;
  fields: TTableField[];
};

export class TableDescriptionCreator {
  private result: TTableDescription = {
    name: "",
    fields: [],
  };

  setName(name: string) {
    this.result.name = name;
  }

  addField(name: string, type: "string" | "number", required: boolean) {
    this.result.fields.push({
      name,
      type,
      required,
    });
  }

  getResult() {
    if (this.result.name.length < 2) {
      throw Error("Table name is less than 2 chars");
    }

    if (this.result.fields?.length < 1) {
      throw Error("Need to have at least one field in the table");
    }

    return this.result;
  }
}
