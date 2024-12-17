# Dockerfile for Node.js server
FROM node:14

# Set environment variable (can be overridden in docker-compose)
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production=false
RUN npm install -g nodemon

# Bundle app source
COPY . .

# Copy the SSL certificates
COPY ./docker/cert.pem /usr/src/app/certs/cert.pem
COPY ./docker/key.pem /usr/src/app/certs/key.pem

# Expose port 443 for HTTPS
EXPOSE 443

# Default command depending on NODE_ENV
CMD if [ "$NODE_ENV" = "development" ]; then npm run dev; else npm start; fi
