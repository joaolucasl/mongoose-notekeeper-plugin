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
