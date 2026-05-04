# Usamos Node 18 Alpine para ligereza
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos archivos de dependencias y hacemos npm install
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli

# Copiamos todo el código al contenedor
COPY . .

# Exponemos el puerto 4200 (Angular por defecto)
EXPOSE 4200

# Comando para levantar servidor de desarrollo (ng serve escuchando en 0.0.0.0)
CMD ["ng", "serve", "--host", "0.0.0.0"]
