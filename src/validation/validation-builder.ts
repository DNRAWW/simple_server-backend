import z from "zod";

// TODO: Refactor
// TODO: Requirements

export enum Requirements {
  MIN = "min",
  MAX = "max",
  MIN_LENGTH = "min_length",
  MAX_LENGTH = "max_length",
  ALPHANUM = "alphanum",
}

export type TRequirement = {
  type: Requirements;
  value: number | boolean;
};

export type TParamsShape = {
  [key: string]: any;
};

const paramTypes = {
  string: z.string,
  number: z.number,
};

const wrappers = {
  number: (validationObj: any) =>
    z.preprocess((input) => {
      const processed = z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .safeParse(input);
      return processed.success ? processed.data : input;
    }, validationObj),
};

export type TRouteParam = {
  name: string;
  type: "string" | "number";
  requirements?: TRequirement[] | undefined;
  required: boolean;
};

export class ValidationBuilder {
  private paramDataType: "string" | "number";

  private result: z.ZodString | z.ZodNumber | null = null;

  constructor(dataType: "string" | "number") {
    this.paramDataType = dataType;
    this.result = paramTypes[this.paramDataType]();
  }

  getResult() {
    if (this.paramDataType !== "string") {
      return wrappers[this.paramDataType](this.result);
    }

    return this.result;
  }

  reset(dataType: "string" | "number") {
    this.paramDataType = dataType;
    this.result = paramTypes[this.paramDataType]();
  }
}
