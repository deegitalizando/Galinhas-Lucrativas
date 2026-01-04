FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Gera a versão final para a internet
RUN npm run build
EXPOSE 8080
# Usa o comando 'serve' para entregar os arquivos da pasta 'dist'
CMD ["npx", "serve", "-s", "dist", "-l", "8080"]
