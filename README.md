# mongoose-notekeeper-plugin

## Installation

```bash
yarn add mongoose-notekeeper-plugin
```

## How To Use

```javascript
// ...
const notekeeperPlugin = require("mongoose-notekeeper-plugin");

const ProductSchema = new Schema({
  name: String,
  type: String,
  price: Number,
  quantity: Number,
  description: String,
  status: String
});

notekeeperPlugin(ProductSchema, { fields: ["quantity", "status"] });
```


This will create new `history` fields named after the original field (e.g. `status_history` for `status`). 
Whenever the fields listed in `fields` are updated, a new entry in an array will be added. It will have the following format:

```Typescript
{
  before: Mongoose.SchemaType,
  after: Mongoose.SchemaType,
  timestamp: Date
}
```
