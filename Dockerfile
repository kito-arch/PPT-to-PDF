FROM node:18-slim

RUN apt-get update && apt-get install -y \
  libreoffice-core \
  libreoffice-writer \
  libreoffice-impress \
  libreoffice-calc \
  libreoffice-common \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "app.js"]
