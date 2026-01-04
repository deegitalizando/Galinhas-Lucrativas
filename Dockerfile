FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Instalamos um servidor leve para entregar os arquivos
RUN npm install -g serve
EXPOSE 8080
# Comando para rodar o site da pasta 'dist' na porta do Google
CMD ["serve", "-s", "dist", "-l", "8080"]
