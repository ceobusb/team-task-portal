FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5052

CMD ["sh", "-c", "npx prisma generate && npm run dev"]
