# VR Session Tracker

VR Session Tracker is a full-stack Node.js and Express application for logging VR play sessions, reviewing session history, and viewing usage stats. It uses server-rendered EJS views, SQLite storage, Bootstrap styling, Jest/Supertest tests, and Docker-based deployment support.

## Features

* Landing page with the total number of sessions logged
* Session logging form with required-field validation
* Session history with game search, headset filtering, and sorting support
* Session detail pages with update and delete actions
* Stats dashboard with total sessions, time played, averages, and top games
* Custom 404 page for unknown routes

## Tech Stack

* Runtime: Node.js
* Web framework: Express
* Views: EJS with express-ejs-layouts
* Database: SQLite through better-sqlite3
* Styling: Bootstrap and custom CSS
* Tests: Jest and Supertest
* Deployment: Docker, Docker Compose, nginx, and AWS EC2

## Local Development

Install dependencies and start the Express app from the `app` directory:

```bash
cd app
npm install
npm start
```

The app runs at `http://localhost:3000`.

## Running Tests

Run the automated test suite from the `app` directory:

```bash
cd app
npm test
```

The Jest suite uses Supertest and an isolated test database.

## Docker Deployment

The project includes Docker Compose configuration for the Express app and an nginx reverse proxy:

```bash
./dev.sh build
./dev.sh install
```

The Compose setup builds the app image from `app/Dockerfile`, builds nginx from `nginx/Dockerfile`, exposes nginx on ports `80` and `443`, and stores persistent app data in `./data`.

## Project Structure

```text
VR_Session_Tracker/
|-- .github/workflows/
|-- app/
|   |-- src/
|   |   |-- routes/
|   |   |-- views/
|   |   |-- public/
|   |   `-- bin/
|   |-- tests/
|   |-- Dockerfile
|   `-- package.json
|-- docs/
|-- lib/
|-- nginx/
|-- docker-compose.yml
|-- dev.sh
`-- README.md
```

## Main Routes

* `GET /` - landing page
* `GET /sessions/new` - session logging form
* `POST /sessions` - create a session
* `GET /sessions` - session history
* `GET /sessions/:id` - session detail
* `POST /sessions/:id/update` - update ratings and notes
* `POST /sessions/:id/delete` - delete a session
* `GET /stats` - stats dashboard
