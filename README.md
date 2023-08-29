# Simple Movie API with Swagger UI

This project is a simple movie API built with Express.js that allows you to manage movies and genres. It includes Swagger UI documentation to help you understand and interact with the API easily. [View Live API](https://movie-api-swagger-ui.onrender.com/api-docs)

## Table of Contents

- [Simple Movie API with Swagger UI](#simple-movie-api-with-swagger-ui)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
  - [API Endpoints](#api-endpoints)
  - [Swagger UI](#swagger-ui)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- Create, read, update, and delete movies.
- Create, read, and delete genres.
- Associate movies with genres.
- Comprehensive Swagger UI documentation for API endpoints.

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed.
- MongoDB installed and running.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Abhi6722/Movie-API-Swagger-UI
   ```

2. Navigate to the project directory:

   ```bash
   cd Movie-API-Swagger-UI
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables (create a .env file and write the following) in a `.env` file.
   ```
    SERVER_URL=http://localhost:3000/api
    PORT=3000
    MONGO_URL=mongodb://localhost/my-movie-api
   ```

5. Start the server:

   ```bash
   npm start
   ```

The server will start, and you can access the API at `http://localhost:3000/api-docs/`.

## Usage

You can interact with the API using tools like Postman or through the Swagger UI.

## API Endpoints

The API provides the following endpoints:

- `/movies`: CRUD operations for movies.
- `/genres`: CRUD operations for genres.
- `/genres/{genreId}/movies`: Get movies by genre.

![swaggerui](https://github.com/Abhi6722/Movie-API-Swagger-UI/assets/62201123/e3bcc62a-7b47-48df-a4c5-6080c0ff3f26)


For detailed information about each endpoint and request/response examples, refer to the [Swagger UI documentation](https://movie-api-swagger-ui.onrender.com/api-docs).

## Swagger UI

Swagger UI is integrated into this project, allowing you to explore and test the API easily. To access Swagger UI, follow these steps:

1. Start the server if it's not already running:

   ```bash
   npm start
   ```

2. Open a web browser and go to:

   ```
   http://localhost:3000/api-docs
   ```

3. Use Swagger UI to view, test, and interact with the API.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and test thoroughly.
4. Create a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
