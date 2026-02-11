# Android

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
