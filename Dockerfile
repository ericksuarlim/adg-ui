# Usamos Node 18 Alpine para ligereza
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Manifests first; install deps before app source (see .dockerignore so host node_modules
# does not overwrite node_modules from this step).
COPY package*.json ./
RUN npm ci
RUN npm install -g @angular/cli

COPY . .

# Default dev port (see docker-compose ADG_UI_PORT; avoid 4200 clashes with other Angular apps)
EXPOSE 4730

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4730"]
