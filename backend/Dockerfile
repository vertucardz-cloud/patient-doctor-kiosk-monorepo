# Stage 1: The Build Stage
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install system dependencies for build (e.g., node-gyp and canvas)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    libpng-dev \
    bash

# Copy dependency files and install them
COPY package*.json ./
RUN npm install

# Copy all source code and the prisma folder
COPY . .

# Generate the Prisma client and build the app
RUN npx prisma generate

RUN npm run build

# Stage 2: The Production Stage
FROM node:22-alpine

WORKDIR /usr/src/app

# IMPORTANT: Install build tools and Python again for the final stage
# This is necessary because npm install --only=production might still need them
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    libpng-dev \
    bash

# Install production-only dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the compiled 'dist' folder
COPY --from=builder /usr/src/app/dist ./dist

# Copy the prisma directory
COPY --from=builder /usr/src/app/prisma ./prisma

# Copy the generated Prisma client
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# COPY --from=builder /usr/src/app/.env ./

# Expose the port
EXPOSE 8101

# Run migrations, seeds, and then start the production app
CMD sh -c "npx prisma migrate deploy --preview-feature && npx prisma db seed && npm run start"

# CMD sh -c "npx prisma migrate deploy && npx prisma db seed && npm run start"
