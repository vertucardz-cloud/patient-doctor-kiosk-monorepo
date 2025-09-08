FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose Vite dev server port
EXPOSE 3039

# Run vite in dev mode
CMD ["npm", "run", "dev", "--", "--host"]
