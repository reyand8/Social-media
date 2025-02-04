FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install


COPY . .

RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 5001

CMD ["sh", "-c", "npm run seed && npm run start:dev"]