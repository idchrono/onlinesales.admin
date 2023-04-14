import {DtoSchema} from "@components/generic-components/common";

const convertSchemaToDtoSchema = (schema: DtoSchema, allSchemas: { [x: string]: DtoSchema }): DtoSchema => {
  const dtoSchema: DtoSchema = {
    type: schema.type,
    enum: schema.enum,
    properties: {},
  };
  if (schema.required && schema.required.length) {
    dtoSchema.required = schema.required;
  }
  if (schema.properties && dtoSchema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      if (value.$ref) {
        const refName = value.$ref.replace('#/components/schemas/', '');
        const refSchema = allSchemas[refName];
        const refDtoSchema = convertSchemaToDtoSchema(refSchema, allSchemas);
        if (dtoSchema.properties) {
          if (refDtoSchema.type === "object" && refDtoSchema.properties) {
            dtoSchema.properties[key] = refDtoSchema.properties;
          } else if (refDtoSchema.type === "string") {
            dtoSchema.properties[key] = {
              "type": "string",
              "enum": refDtoSchema.enum
            }
          }
        }
      } else {
        dtoSchema.properties[key] = {
          type: value.type,
        };
        if (value.format) {
          dtoSchema.properties[key].format = value.format;
        }
        if (value.nullable) {
          dtoSchema.properties[key].nullable = value.nullable;
        }
        if (value.description) {
          dtoSchema.properties[key].description = value.description;
        }
      }
    }
  }
  return dtoSchema;
}

export const getSchemaDto = (name: string, allSchemas: { [x: string]: DtoSchema; }): DtoSchema => {
  if(name in allSchemas){
    // @ts-ignore
    const schema = allSchemas[name];
    return convertSchemaToDtoSchema(schema, allSchemas);
  }
  throw `${name} schema not found.`
};
