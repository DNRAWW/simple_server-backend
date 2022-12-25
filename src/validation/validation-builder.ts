import z from "zod";
import validator from "validator";

// TODO: Refactor
// TODO: Requirements

export enum Requirements {
  MIN = "min",
  MAX = "max",
  ALPHANUM = "alphanum",
}

export type TRequirement = {
  type: Requirements;
  value: number | undefined;
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

  private result: z.ZodTypeAny | null = null;

  constructor(dataType?: "string" | "number" | undefined) {
    if (!dataType) {
      this.paramDataType = "string";
      return;
    }

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

  functionByString(functionName: Requirements, value?: number | undefined) {
    const validatitonFunctionsMap: {
      [key in Requirements]: Function;
    } = {
      min: this.min.bind(this),
      max: this.max.bind(this),
      alphanum: this.alphanum.bind(this),
    };

    validatitonFunctionsMap[functionName](value);
  }

  optional() {
    this.result = this.result.optional();
  }

  min(minValue: number) {
    this.result = (this.result as z.ZodNumber | z.ZodString).min(minValue);
  }

  max(maxValue: number) {
    this.result = (this.result as z.ZodNumber | z.ZodString).max(maxValue);
  }

  alphanum() {
    if (this.paramDataType === "string") {
      this.result = (this.result as z.ZodString).refine(
        (val) => validator.isAlphanumeric(val, "en-US"),
        "String contains chars that are not allowed"
      );
      return;
    }

    throw new Error("Wrong type");
  }
}
