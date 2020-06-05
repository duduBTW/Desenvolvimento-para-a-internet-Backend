const mongoose = require("mongoose");

const animeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  episodesWatched: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  anilistId: {
    type: Number,
    required: false,
  },
});

module.exports = mongoose.model("anime", animeSchema);
