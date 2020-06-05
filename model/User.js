const mongoose = require("mongoose");
const animeSchema = require("./Anime");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 255,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  animes: [animeSchema.schema],
});

module.exports = mongoose.model("user", userSchema);
