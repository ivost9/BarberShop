# ЕТАП 1: Изграждане (Build)
# Използваме Node 20, за да избегнем онези предупреждения, които видя в терминала
FROM node:20-alpine AS build

WORKDIR /app

# Инсталираме библиотеките
COPY package*.json ./
RUN npm install

# Копираме кода и създаваме продукционния билд
COPY . .
RUN npm run build

# ЕТАП 2: Сервиране (Production)
# Използваме супер лек Nginx сървър
FROM nginx:stable-alpine

# Копираме само готовите файлове от предишния етап в папката на Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Nginx по подразбиране работи на порт 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]