# Usando uma imagem base do Node.js
FROM node:18 AS build

# Definindo o diretório de trabalho no container
WORKDIR /app

# Copiando os arquivos do projeto
COPY package*.json ./

# Instalando dependências
RUN npm install

# Copiando o restante dos arquivos do projeto
COPY . .

# Compilando a aplicação
RUN npm run build

# Instalando o PM2 para rodar a aplicação em produção
RUN npm install -g pm2

# Expondo a porta que a aplicação vai rodar
EXPOSE 3000

# Definindo o comando para rodar a aplicação
CMD ["pm2-runtime", "dist/main.js"]
