const { Schema, Mongoose } = require("mongoose");
const mongoose = new Mongoose();
const { MongoMemoryServer } = require("mongodb-memory-server");

const notekeeperPlugin = require("../dist/index");

describe("Mongoose Notekeeper Plugin", () => {
  describe("When defining a new Schema and using the plugin to track a field named `name`", () => {
    let mongod;
    setup(mongod);

    const PokemonSchema = new Schema({
      name: String,
      type: String
    });

    notekeeperPlugin(PokemonSchema, { fields: ["name"] });
    const PokemonModel = mongoose.connection.model("pokemon", PokemonSchema);

    it("created documents should have a `history` field related to the required fields", async function() {
      const pokemon = await PokemonModel.create({
        name: "Charmander",
        type: "Fire"
      });

      expect(pokemon).toBeDefined();
      expect(pokemon.name_history).toBeDefined();
      return expect(pokemon.name_history).toEqual(expect.any(Array));
    });

    it("after updating a field being watched, a new history entry must be added", async function() {
      const charmander = await PokemonModel.create({
        name: "Charmander",
        type: "Fire"
      });

      expect(charmander.name_history.length).toBe(1);

      charmander.name = "Charmeleon";
      await charmander.save();

      const charmeleon = await PokemonModel.findOne({ name: "Charmeleon" });

      expect(charmeleon.name_history.length).toBe(2);
    });
  });

  describe("When defining a new Schema and using the plugin to track a multiple fields", () => {
    let mongod;
    setup(mongod);

    const ProductSchema = new Schema({
      name: String,
      type: String,
      price: Number,
      quantity: Number,
      description: String,
      status: String
    });

    notekeeperPlugin(ProductSchema, { fields: ["quantity", "status"] });

    const ProductModel = mongoose.connection.model("products", ProductSchema);

    it("created documents should have a `history` field for both fields", async function() {
      const product = await ProductModel.create({
        name: "Macbook",
        type: "laptop",
        price: 7000,
        quantity: 3,
        description: "An very expensive compouter",
        status: "enabled"
      });

      expect(product).toBeDefined();
      expect(product.quantity_history).toBeDefined();
      expect(product.status_history).toBeDefined();
      expect(product.quantity_history).toEqual(expect.any(Array));
      expect(product.status_history).toEqual(expect.any(Array));
    });

    it("after updating a field being watched, a new history entry must be added", async function() {
      const iPhone5 = await ProductModel.create({
        name: "iPhone 5",
        type: "phone",
        price: 1000,
        quantity: 5,
        description: "An very expensive computer",
        status: "enabled"
      });

      expect(iPhone5.quantity_history.length).toBe(1);

      iPhone5.quantity = 3;
      await iPhone5.save();

      expect(iPhone5.quantity_history.length).toBe(2);
    });

    it("after updating a non watched field, no history fields should be update", async function() {
      const iPhone5 = await ProductModel.create({
        name: "iPhone 5",
        type: "phone",
        price: 1000,
        quantity: 5,
        description: "An very expensive computer",
        status: "enabled"
      });

      expect(iPhone5.quantity_history.length).toBe(1);
      expect(iPhone5.status_history.length).toBe(1);

      iPhone5.name = "iPhone 5 PLUS MEGA POWER";
      await iPhone5.save();

      expect(iPhone5.quantity_history.length).toBe(1);
      expect(iPhone5.status_history.length).toBe(1);
    });
  });

  describe("When defining a new Schema and using the plugin with invalid field definitions ", () => {
    const PokemonSchema = new Schema({
      name: String,
      type: String
    });

    it("should throw an error if an empty `fields` array option", () => {
      return expect(() =>
        notekeeperPlugin(PokemonSchema, { fields: [] })
      ).toThrow();
    });

    it("should throw an error while validating the schema if a non existing field is defined", () => {
      return expect(() =>
        notekeeperPlugin(PokemonSchema, { fields: ["potato"] })
      ).toThrow();
    });

    it("should throw an error if no `fields` options is passed", () => {
      return expect(() => notekeeperPlugin(PokemonSchema)).toThrow();
    });

    it("should throw an error if fields is not an array", () => {
      return expect(() =>
        notekeeperPlugin(PokemonSchema, { fields: "banana" })
      ).toThrow();
    });
  });
});

function setup(mongod) {
  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });
}
