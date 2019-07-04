const { Schema, Mongoose } = require("mongoose");
const mongoose = new Mongoose();
const { MongoMemoryServer } = require("mongodb-memory-server");

const notekeeperPlugin = require("../dist/index");

describe("Mongoose Notekeeper Plugin", () => {
  describe("When defining a new Schema and using the plugin to track a field named `name`", () => {
    let mongod;

    beforeAll(async () => {
      mongod = new MongoMemoryServer();
      const uri = await mongod.getConnectionString();
      await mongoose.connect(uri);
    });

    afterAll(async () => {
      await mongoose.disconnect();
      await mongod.stop();
    });

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

  describe("When defining a new Schema and using the plugin with invalid field definitions ", () => {
    const PokemonSchema = new Schema({
      name: String,
      type: String
    });

    it("should throw an error while validating the schema", () => {
      return expect(() =>
        notekeeperPlugin(PokemonSchema, { fields: [] })
      ).toThrow();
    });
  });
});
