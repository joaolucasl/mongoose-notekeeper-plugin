import { Schema, SchemaType, Document } from "mongoose";
import { zip, fromPairs, mergeAll, last } from "ramda";
import assert from "assert";

interface PluginOptions {
  fields?: string[];
}

function noteKeeperPlugin(schema: Schema, options: PluginOptions) {
  assert.ok(options.fields, "options.fields must be defined.");
  assert.ok(Array.isArray(options.fields), "options.fields must be an array.");
  assert.ok(
    options.fields!!.length,
    "options.fields must be a non-empty array."
  );
  assert.ok(
    options.fields!!.every(field => !!schema.path(field)),
    "Not all values in `options.fields` exist in the schema definition."
  );

  const definitions = generateHistoryFieldsDefinitions(
    schema,
    options.fields!!
  );

  schema.add(definitions);

  schema.pre("save", function() {
    options.fields!!.forEach(field => updateHistoryForField(this, field));
  });
}

interface HistoryEntryDefinition {
  before: Schema | SchemaType;
  after: Schema | SchemaType;
  timestamp?: { type: DateConstructor; default: Function };
}

interface HistoryFieldDefinition {
  [historyFieldName: string]: HistoryEntryDefinition[];
}

function generateHistoryFieldsDefinitions(
  schema: Schema,
  fields: string[]
): HistoryFieldDefinition {
  const defs = fields.map(field => {
    const fieldTypeInSchema = schema.obj[field];
    const historyFieldName = `${field}_history`;

    const historyFieldDefinition = {
      [historyFieldName]: [
        {
          before: fieldTypeInSchema as Schema | SchemaType,
          after: fieldTypeInSchema as Schema | SchemaType,
          timestamp: { type: Date, default: Date.now }
        } as HistoryEntryDefinition
      ]
    };

    return historyFieldDefinition;
  });

  return mergeAll(defs);
}

interface HistoryEntry {
  before: any;
  after: any;
  timestamp?: Date | String;
}

function updateHistoryForField(document: Document, field: string) {
  const historyFieldName = `${field}_history`;
  const currentHistory: HistoryEntry[] = document.get(historyFieldName);

  let update: HistoryEntry;
  if (document.isNew && !!document.get(field)) {
    update = {
      before: null,
      after: document.get(field)
    };
  } else {
    if (document.isModified(field)) {
      update = {
        before: last(currentHistory).after,
        after: document.get(field)
      };
    } else {
      return;
    }
  }
  const updatedHistory = currentHistory.concat(update);
  document.set(historyFieldName, updatedHistory);
}

export default noteKeeperPlugin;
