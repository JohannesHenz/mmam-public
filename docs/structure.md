# `mmam/database`
* contains the database singleton which ensure the connection to postgresql
* `database.query` is the main function to interact with the database

# `mmam/docker`
* `run.*` to build and run the docker image

# `mmam/docs`
* ...

# `mmam/public`
* contains all files (css, js, images, ...) that the frontend can access

# `mmam/utils`
* contains a logger singleton for the backend

# `mmam/views`
* contains views (html files) which the backend sends to the frontend

# `mmam/routes`
* `index.js` contains all routes

# `mmam/server.js`
* the backend

# `mmam/run.*`
* installs all npm packages and starts the backend
* add the parameter `docker` if you wish to rebuild the postgresql database
