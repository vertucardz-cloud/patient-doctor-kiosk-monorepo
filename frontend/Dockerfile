# FROM node:22-alpine

# # Set working directory
# WORKDIR /usr/src/app

# # Copy package.json and install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy project files
# COPY . .

# # Expose Vite dev server port
# EXPOSE 3039

# # Run vite in dev mode
# CMD ["npm", "run", "dev", "--", "--host"]


# # Stage 1: Build the frontend
# FROM node:22-alpine AS builder

# WORKDIR /usr/src/app

# # Copy package.json and install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy all source files
# COPY . .

# # Build the app for production
# RUN npm run build

# # Stage 2: Serve the build with a lightweight web server
# FROM nginx:alpine

# # Copy built files from the builder stage
# COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# # Expose port 80 (standard HTTP port)
# EXPOSE 3039

# # Start NGINX automatically
# CMD ["nginx", "-g", "daemon off;"]


# Stage 1: Build the frontend
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the build
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Install a static file server
RUN npm install -g serve

# Copy the built files from the previous stage
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 3039

# Start the static file server
CMD serve -s dist -l 3039
