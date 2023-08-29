const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const moviesRouter = require('./routes/movies');
const genresRouter = require('./routes/genres');
require('dotenv').config();

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Movie API",
			version: "1.0.0",
			description: "A simple Express Movie API",
		},
		servers: [
			{
				url: process.env.SERVER_URL,
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB configuration
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

// Use route files
app.use('/api/', moviesRouter);
app.use('/api/', genresRouter);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const PORT = process.env.PORT || 3000;

//Connect to the database before listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server Running on port ${PORT}`);
    })
})
