const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');
const redisClient = require('../redis');

/**
 * @swagger
 * components:
 *   schemas:
 *     Genre:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the genre
 *         name:
 *           type: string
 *           description: Genre name
 *       example:
 *         name: Drama
 */

/**
 * @swagger
 * tags:
 *   name: Genres
 *   description: List of Movie Genres
 */


/**
 * @swagger
 * /genres:
 *   get:
 *     summary: Returns the list of all the genres
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: The list of the genres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Genre'
 */
// Get all genres
router.get('/genres', async (req, res) => {
  const cacheKey = 'genres:all';

  try {
    // Check if the data is cached
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // If cached data exists, send it as the response
      const genres = JSON.parse(cachedData);
      res.json(genres);
    } else {
      // If no cached data, query the database
      const genres = await Genre.find();

      // Store the result in the cache for future use with a 1-hour expiration time
      await redisClient.setex(cacheKey, 3600, JSON.stringify(genres));

      res.json(genres);
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/**
 * @swagger
 * /genres-movies:
 *   get:
 *     summary: Returns the list of all the genres with movies
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: The list of the genres with movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Genre'
 */
// Get all genres with movies
router.get('/genres-movies', async (req, res) => {
  const cacheKey = 'genres:all-with-movies';

  try {
    // Check if the data is cached
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // If cached data exists, send it as the response
      const genres = JSON.parse(cachedData);
      res.json(genres);
    } else {
      // If no cached data, query the database and populate movies
      const genres = await Genre.find().populate('movies');

      // Store the result in the cache for future use with a 1-hour expiration time
      await redisClient.setex(cacheKey, 3600, JSON.stringify(genres));

      res.json(genres);
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /genres/{genreId}/movies:
 *   get:
 *     summary: Get movies by genre
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: genreId
 *         schema:
 *           type: string
 *         required: true
 *         description: The genre id
 *     responses:
 *       200:
 *         description: List of movies by genre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Genre not found
 */
router.get('/genres/:genreId/movies', async (req, res) => {
  const { genreId } = req.params;
  const cacheKey = `genre:${genreId}:movies`;

  try {
    // Check if the data is cached
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // If cached data exists, send it as the response
      const movies = JSON.parse(cachedData);
      res.json(movies);
    } else {
      // If no cached data, query the database and populate movies
      const genre = await Genre.findById(genreId).populate('movies');

      if (!genre) {
        return res.status(404).json({ error: 'Genre not found' });
      }

      // Extract the movies from the genre object
      const movies = genre.movies;

      // Store the result in the cache for future use with a 1-hour expiration time
      await redisClient.setex(cacheKey, 3600, JSON.stringify(movies));

      res.json(movies);
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /genres:
 *   post:
 *     summary: Create a new genre
 *     tags: [Genres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Genre'
 *     responses:
 *       201:
 *         description: The genre was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genre'
 *       400:
 *         description: Invalid data
 */
router.post('/genres', async (req, res) => {
  const { name } = req.body;
  try {
    const genre = await Genre.create({
      name,
    });

    // Cache the newly created genre with a cache key
    const cacheKey = `genre:${genre._id}`;
    await redisClient.setex(cacheKey, 3600, JSON.stringify(genre)); // Cache for 1 hour

    res.status(201).json({ message: 'Genre Created', genre });
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

/**
 * @swagger
 * /genres/{genreId}:
 *   delete:
 *     summary: Remove the genre by id
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: genreId
 *         schema:
 *           type: string
 *         required: true
 *         description: The genre id
 * 
 *     responses:
 *       200:
 *         description: The genre was deleted
 *       404:
 *         description: Genre not found
 */
router.delete('/genres/:genreId', async (req, res) => {
  const { genreId } = req.params;
  try {
    // Attempt to delete the genre from the database
    const genre = await Genre.findByIdAndDelete(genreId);
    if (!genre) {
      return res.status(404).json({ error: 'Genre not found' });
    }

    // If the genre was successfully deleted from the database, also remove it from the cache
    const cacheKey = `genre:${genreId}`;
    await redisClient.del(cacheKey);

    res.json({ message: 'Genre deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
