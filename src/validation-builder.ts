import z from "zod";

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

export const paramTypes = {
  string: z.string,
  number: z.number,
};

export type TRouteParam = {
  name: string;
  type: "string" | "number";
  requirements?: TRequirement[] | undefined;
  required: boolean;
};

export class ValidationBuilder {
  private readonly paramDataType: "string" | "number";

  private result: z.ZodString | z.ZodNumber | null = null;

  constructor(dataType: "string" | "number") {
    this.paramDataType = dataType;
    this.result = paramTypes[this.paramDataType]();
  }

  getResult() {
    if (this.paramDataType === "number") {
      return z.preprocess((input) => {
        const processed = z
          .string()
          .regex(/^\d+$/)
          .transform(Number)
          .safeParse(input);
        return processed.success ? processed.data : input;
      }, this.result);
    }

    return this.result;
  }
}
