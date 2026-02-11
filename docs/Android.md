# Android ou sem docker

* tambem funciona em ubuntu sem docker

## Termux

```bash
pkg update && pkg upgrade -y
pkg install proot-distro -y
proot-distro install ubuntu
proot-distro login ubuntu

# Dentro do Ubuntu
apt update && apt upgrade -y
apt install curl -y
apt update 
apt install nginx -y
apt install -y nodejs npm build-essential python3 python3-setuptools
npm install -g yarn

```

## Git

```bash
git clone https://github.com/dellannegabryel-commits/LocalCloud

```

## Backend

```bash
cd LocalCloud/backend
node src/server.js
```

## Frontend

```bash
cd LocalCloud/frontend
yarn install
yarn build
```

## nginx

```bash
cd LocalCloud/frontend
nginx -c nginx_android.conf
```

## script para rodar tudo

```bash
nano cloud.sh
```

```bash
#!/bin/bash

# Caminhos (Ajuste se as pastas forem diferentes)
BACKEND_DIR="$HOME/LocalCloud/backend"
NGINX_CONF="/etc/nginx/nginx.conf"

echo "--- Iniciando LocalCloud ---"

# 1. Limpando processos antigos (Nginx e Node)
echo "[1/4] Limpando processos antigos..."
pkill -9 nginx
pkill -9 node
sleep 1

# 2. Testando e Iniciando o Nginx
echo "[2/4] Verificando configuração do Nginx..."
nginx -t
if [ $? -eq 0 ]; then
    echo "      Iniciando Nginx na porta 8080..."
    nginx
else
    echo "ERROR: Erro na configuração do Nginx. Verifique com 'nginx -t'."
    exit 1
fi

# 3. Iniciando o Backend em segundo plano
echo "[3/4] Iniciando Backend Node.js na porta 3001..."
cd $BACKEND_DIR
# Usamos o '&' para rodar em segundo plano e redirecionamos o log para um arquivo
nohup node server.js > backend.log 2>&1 &

# 4. Verificação final
sleep 2
if pgrep -x "node" > /dev/null
then
    echo "[4/4] Backend rodando com sucesso!"
    echo "--- LocalCloud está ONLINE em http://localhost:8080 ---"
else
    echo "ERROR: O Backend falhou ao iniciar. Verifique o log em $BACKEND_DIR/backend.log"
fi
```

```bash
chmod +x cloud.sh
./cloud.sh
```
