# Dockerfile for CampingGearBot
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Set environment variables (edit as needed)
ENV NODE_ENV=production

# Expose port if needed (for webhook or future API)
# EXPOSE 3000

CMD ["npm", "start"]
