# Dockerfile for Node.js server
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Copy the SSL certificates
COPY cert.pem /usr/src/app/certs/cert.pem
COPY key.pem /usr/src/app/certs/key.pem

# Expose port 3313
EXPOSE 3313

# Start the server
CMD [ "node", "server.js" ]
