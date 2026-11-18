# Project structure

* `server.js`: Express app setup and HTTPS server
* `routes/`: one router per feature; `routes/index.js` mounts them all
* `database/`: Postgres client singleton that reconnects automatically; `database.query()` is the main entry point
* `utils/`: backend logger and in-memory location store
* `views/`: EJS templates rendered by the backend
* `public/`: static frontend assets (JS, CSS, images)
* `docker/`: Postgres image and schema (`init.sql`), plus `run.*` to start the database standalone
* `scripts/`: development helpers (`generate-certs.js`)
* `run.*`: installs npm packages and starts the backend; pass `docker` to also (re)build the database container
