const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  director: { type: String, required: true },
  actors: [{ type: String, required: true }],
  imbdrating: { type: String, required: true },
  image: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
