# 📁 LocalDrive: Seu Servidor de Arquivos Pessoal

Um sistema de armazenamento de arquivos privado e robusto para rede doméstica, otimizado para mobile e entregue via **Docker**. Construído com a **Stack JavaScript** (Node.js + React) e persistência em **SQLite**, o LocalDrive oferece uma experiência de "nuvem pessoal" sem limites artificiais.

---

## 🚀 Tecnologias Utilizadas

### Core

* **Frontend:** React (Vite), Tailwind CSS v4, Lucide Icons.
* **Backend:** Node.js, Express.
* **Banco de Dados:** SQLite (Metadados dos arquivos).

### Infraestrutura & DevOps

* **Containerização:** Docker & Docker Compose.
* **Servidor Web / Proxy:** Nginx (Proxy Reverso para comunicação unificada).
* **Uploads:** Multer (Configurado para uploads massivos/ilimitados).

---

## ✨ Funcionalidades Implementadas

* ✅ **Upload sem Limites**: Suporte para arquivos gigantes (vídeos 4K, arquivos compactados) limitado apenas pelo seu disco.
* ✅ **Dashboard de Estatísticas**: Visualize o uso total de armazenamento e contagem de arquivos em tempo real.
* ✅ **Visualizador Integrado**: Preview de imagens, vídeos (MP4, etc) e PDFs diretamente no navegador.
* ✅ **Explorer Administrativo**: Navegação completa com confirmação de exclusão e download rápido.
* ✅ **Mobile Responsive**: Design otimizado para celulares com barra de navegação inferior e visual "Glassmorphism" premium.
* ✅ **Sistema de Temas**: Escolha entre **Oled Dark**, **Indigo Night** ou **Classic Slate** (persiste no navegador).

---

## 📂 Estrutura do Projeto

```text
.
├── backend/
│   ├── src/             
│   │   ├── database/    # SQLite init
│   │   └── server.js    # API Endpoints & Logic
│   └── Dockerfile       # Node-Alpine image
├── frontend/
│   ├── src/             # UI Components & Themes
│   ├── nginx.conf       # Proxy reverso & Static serving
│   └── Dockerfile       # Multi-stage build (Node + Nginx)
├── docker-compose.yml   # Orquestração completa
└── README.md
```

---

## ⚡ Como Rodar o Projeto

A maneira mais fácil e recomendada é usando **Docker Compose**.

1. Certifique-se de ter o [Docker](https://www.docker.com/) instalado.
2. No diretório raiz do projeto, execute:

```bash
docker compose up --build
```

O sistema estará disponível em:
* **Desktop/Local:** `http://localhost`
* **Mobile/Rede Local:** `http://[IP-DO-SEU-PC]` (Porta 80 padrão)

---

## 📱 Acesso Mobile

O LocalDrive foi desenhado para ser acessado de qualquer dispositivo na sua casa.

1. Descubra seu IP local (ex: `192.168.0.105`).
2. Abra o navegador no seu celular e digite o IP.
3. Use a aba "Upload" centralizada para enviar fotos e vídeos do seu celular diretamente para o seu PC.

---

## 📝 Configurações de Administrador

* **Uploads**: O sistema está configurado com `client_max_body_size 0` no Nginx, permitindo uploads de qualquer tamanho.
* **Persistência**: Os arquivos enviados são salvos no volume `backend_uploads` definido no Docker Compose, garantindo que seus dados não sumam ao reiniciar os containers.
* **Segurança Local**: Por ser um projeto de rede doméstica, o foco é em performance e facilidade de acesso.

---

*Desenvolvido com foco em privacidade e autonomia digital.*
