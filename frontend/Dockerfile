FROM node:20-alpine AS build
WORKDIR /app

# Copier les fichiers de configuration
COPY package.json package-lock.json* ./
RUN npm ci

# Copier les sources
COPY . .

# Construire l'application
RUN npm run build

# Image finale avec Nginx pour servir l'application
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
