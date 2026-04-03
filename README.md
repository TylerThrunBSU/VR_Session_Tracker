# VR Session Tracker

A full-stack web app for logging and analyzing VR play sessions.

Built with Node.js, Express, EJS, SQLite, and Bootstrap 5. Deployed to AWS EC2 via Docker.

**Course:** CS 408 — Spring 2026  
**Author:** Tyler Thrun

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Templates | EJS (server-side rendered) |
| Database | SQLite via better-sqlite3 |
| Styling | Bootstrap 5 + custom CSS |
| Deployment | AWS EC2 + Docker |
| Testing | Playwright |

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with session count |
| `/sessions/new` | Log a new session (form) |
| `/sessions` | Session history with filters |
| `/sessions/:id` | Session detail, edit, delete |
| `/stats` | Stats dashboard |

---

## Running Locally

```bash
cd app
npm install
npm start
```

App runs at `http://localhost:3000`.

---

## Running Tests

```bash
cd app
npm test
```

Uses Jest + Supertest. Tests run against an in-memory test database — no setup needed.

---

## Docker (Local)

```bash
./dev.sh build
./dev.sh up
```

App runs at `http://localhost:3000`.

To stop:

```bash
./dev.sh down
```

---

## EC2 Deployment

### 1. Set up your .env file

Create a `.env` file in the project root:

```bash
APP_NAME=vr-session-tracker
APP_VERSION=latest
DOCKER_USERNAME=your_dockerhub_username
EC2_HOST=your.ec2.ip.address
EC2_USER=ubuntu
EC2_KEY=~/.ssh/your-key.pem
APP_PORT=3000
```

### 2. Set up a fresh EC2 instance

```bash
./dev.sh new
```

This installs Docker and all dependencies on the EC2 instance.

### 3. Deploy

```bash
./dev.sh deploy
```

This builds the image, pushes it to Docker Hub, and starts it on EC2.

### 4. Access the app

```bash
./dev.sh web
```

---

## dev.sh Commands

```
./dev.sh help       # show all commands
./dev.sh new        # install packages on EC2
./dev.sh build      # build Docker image
./dev.sh up         # start containers locally
./dev.sh down       # stop containers
./dev.sh deploy     # build + push + deploy to EC2
./dev.sh logs       # tail container logs
./dev.sh ssh        # SSH into EC2
./dev.sh clean      # remove containers and data
./dev.sh nuke       # remove containers, images, and data
```

---

## Project Structure

```
vr-session-tracker/
├── dev.sh                  # deployment script
├── docker-compose.yml      # local Docker config
├── lib/
│   ├── fancy.sh            # output helpers
│   └── dev.sh.completion   # bash completion
└── app/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── app.js
        ├── bin/
        │   ├── db.js       # database + all helpers
        │   └── www         # server entry point
        ├── routes/
        │   └── index.js    # all routes
        ├── views/
        │   ├── layout.ejs
        │   ├── index.ejs
        │   ├── log-session.ejs
        │   ├── history.ejs
        │   ├── session-detail.ejs
        │   ├── stats.ejs
        │   └── 404.ejs
        └── public/
            └── stylesheets/
                └── style.css
```
