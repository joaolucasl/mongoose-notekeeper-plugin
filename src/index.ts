import { Schema } from "mongoose";

interface PluginOptions {
  // fields
}

function noteKeeperPlugin(schema: Schema, options: Object) {
  console.log('yo')
  return "hello"
}

export default noteKeeperPlugin