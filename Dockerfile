FROM node:16.9.0

# Image name & Author
LABEL maintainer="Généreux AKOTENOU - genereux.akotenou@gmail.com"

# Set the working directory
WORKDIR /usr/src/app

# Copy the necessary files
COPY . .

# Install dependencies
RUN npm install

EXPOSE 3000 9204
CMD ["npm", "run", "debug"]
