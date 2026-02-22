# Използваме лек образ на Node.js
FROM node:18-alpine

# Работна директория
WORKDIR /app

# Копираме файловете за зависимост
COPY package*.json ./

# Инсталираме зависимостите
RUN npm install

# Копираме останалия код
COPY . .

# Експонираме порта, на който слуша Express (напр. 5000)
EXPOSE 5000

# Стартираме приложението
CMD ["node", "server.js"]