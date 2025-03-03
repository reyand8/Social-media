FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./prisma/schema.prisma ./prisma/schema.prisma


COPY . .

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate dev --name init && npm run seed && npm run start:dev"]