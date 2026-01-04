FROM node:18-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código do seu app
COPY . .

# Expõe a porta que o Cloud Run usa
EXPOSE 8080

# Comando para iniciar o servidor
CMD ["npm", "start"]
