FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Gera a pasta dist com os arquivos do site
RUN npm run build
EXPOSE 8080
# Comando que usamos no package.json
CMD ["npm", "start"]
