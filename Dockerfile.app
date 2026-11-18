FROM node:20

# Can be overridden in docker-compose
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

WORKDIR /usr/src/app

# Install dependencies (incl. dev dependencies for nodemon in development)
COPY package*.json ./
RUN npm install --include=dev

# Bundle app source (TLS certificates are expected in ./certs, see `npm run certs`)
COPY . .

EXPOSE 443

CMD if [ "$NODE_ENV" = "development" ]; then npm run dev; else npm start; fi
