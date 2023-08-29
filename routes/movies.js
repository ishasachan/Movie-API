const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Genre = require('../models/Genre');
const redisClient = require('../redis');

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - name
 *         - director
 *         - actors
 *         - imbdrating
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the movie
 *         name:
 *           type: string
 *           description: Movie name
 *         director:
 *           type: string
 *           description: Movie director
 *         actors:
 *           type: array
 *           description: Movie actors
 *         imbdrating:
 *           type: number
 *           description: IMDB rating
 *         image:
 *           type: string
 *           description: Movie image URL
 *         genres:
 *           type: array
 *           description: Movie genres
 *       example:
 *         name: The Shawshank Redemption
 *         director: Frank Darabont
 *         actors: ["Tim Robbins", "Morgan Freeman"]
 *         imbdrating: 9.3
 *         image: "https://www.example.com/movie-image.jpg"
 *         genres: ["64fafd2832b624f30a4f4bf7"]
 */

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: The Movie API
 */


/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Returns the list of all the movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: The list of the movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
// Get all movies
router.get('/movies', async (req, res) => {
  const cacheKey = 'movies:all';

  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      const movies = JSON.parse(cachedData);
      res.json(movies);
    } else {
      const movies = await Movie.find();
      await redisClient.setex(cacheKey, 3600, JSON.stringify(movies)); // Cache for 1 hour
      res.json(movies);
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get the movie by id
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie id
 *     responses:
 *       200:
 *         description: The movie description by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: The movie was not found
 */
router.get('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `movie:${id}`; // Create a unique cache key for each movie

  try {
    // Check if the data is cached
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // If cached data exists, send it as the response
      const movie = JSON.parse(cachedData);
      res.json(movie);
    } else {
      // If no cached data, query the MongoDB database
      const movie = await Movie.findById(id).populate('genres');

      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      // Store the result in the cache for future use
      await redisClient.setex(cacheKey, 3600, JSON.stringify(movie)); // Cache for 1 hour

      res.json(movie);
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: The movie was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid data
 */
router.post('/movies', async (req, res) => {
  const { name, director, actors, imbdrating, image, genres } = req.body;
  try {
    const movie = await Movie.create({
      name,
      director,
      actors,
      imbdrating,
      image,
      genres,
    });

    // Update genres with the movie's ID
    await Genre.updateMany(
      { _id: { $in: genres } },
      { $push: { movies: movie._id } }
    );

    // Clear the movies:all cache because a new movie has been added
    await redisClient.del('movies:all');

    res.status(201).json({ message: 'Movie Created', movie });
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *  put:
 *    summary: Update the movie by the id
 *    tags: [Movies]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The movie id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Movie'
 *    responses:
 *      200:
 *        description: The movie was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Movie'
 *      404:
 *        description: The movie was not found
 *      500:
 *        description: Some error happened
 */
router.put('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { name, director, actors, imbdrating, image, genres } = req.body;
  try {
    const movie = await Movie.findByIdAndUpdate(
      id,
      {
        name,
        director,
        actors,
        imbdrating,
        image,
        genres,
      },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Update genres with the movie's ID
    await Genre.updateMany(
      { _id: { $in: genres } },
      { $push: { movies: movie._id } }
    );

    // Clear the movies:all cache because a movie has been updated
    await redisClient.del('movies:all');

    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Remove the movie by id
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie id
 * 
 *     responses:
 *       200:
 *         description: The movie was deleted
 *       404:
 *         description: The movie was not found
 */
router.delete('/movies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Clear the movies:all cache because a movie has been deleted
    await redisClient.del('movies:all');

    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
