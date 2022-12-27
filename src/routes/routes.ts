import { Express } from "express";
import { TRouteParam } from "src/validation/validation-builder";
import validator from "validator";
import { z } from "zod";
import { RouteCreator } from "./route-creator";

const newRouteValidation = z.object({
  name: z.string().trim().min(2),
  params: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(2)
          .refine(
            (val) => validator.isAlphanumeric(val, "en-US"),
            "String contains chars that are not allowed"
          ),
        type: z.string().refine((val) => {
          if (val === "string" || val === "number") {
            return true;
          }

          return false;
        }, "Value can only be 'string' or 'number'"),
        requirements: z
          .array(
            z
              .object({
                type: z.enum(["min", "max", "alphanum"]),
                value: z
                  .preprocess((input) => {
                    const processed = z
                      .string()
                      .regex(/^\d+$/)
                      .transform(Number)
                      .safeParse(input);
                    return processed.success ? processed.data : input;
                  }, z.number().min(1))
                  .optional(),
              })
              .refine((input) => {
                if (input.type && input.type !== "alphanum" && !input.value) {
                  return false;
                }

                return true;
              }, "Requirement should have a value")
          )
          .optional(),
        required: z.boolean(),
      })
    )
    .min(1),
});

export function initRoutes(app: Express) {
  app.post("/create-route", async (req, res) => {
    const routeCreator = RouteCreator.getInstance();

    try {
      const validatedData = newRouteValidation.parse(req.body);

      await routeCreator.createNewRoute(
        validatedData.name,
        validatedData.params as TRouteParam[]
      );

      res.status(200).send("Success");
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).send({ type: "Validation error", errors: e.errors });
        return;
      }

      res.status(500).send("Server error");
      return;
    }
  });

  console.log("/create-route initialized");
}
