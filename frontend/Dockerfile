FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

# Install dependencies 
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Source code will be mounted in docker-compose for live reload
EXPOSE 5173

CMD ["pnpm", "run", "dev", "--host"]
