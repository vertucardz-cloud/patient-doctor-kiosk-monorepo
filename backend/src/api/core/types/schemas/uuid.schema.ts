import * as Joi from "joi";
import { AnySchema } from "joi";

const uuid = (label: string, isRequired = true): AnySchema => {
  const schema = Joi.string()
    .guid({ version: ["uuidv4", "uuidv5"] })
    .label(label);

  return isRequired ? schema.required() : schema.optional().allow(null).allow("");
};

export { uuid };
