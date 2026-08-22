FROM node:20.10.0

RUN mkdir -p /usr/src/artstore

COPY dist /usr/src/artstore/dist
COPY templates /usr/src/artstore/templates
COPY products.json /usr/src/artstore/
COPY server.config.json /usr/src/artstore/
COPY production.server.config.json /usr/src/artstore/
COPY package.json /usr/src/artstore/

WORKDIR /usr/src/artstore

RUN npm install --omit=dev
RUN npm install wait-for-it.sh@1.0.0

ENV NODE_ENV=production
ENV SERVER_CONFIG='production.server.config.json'

# COOKIE_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL are
# injected at container runtime (e.g. `docker run -e` / `fly secrets set`),
# not baked into the image.

EXPOSE 5000
ENTRYPOINT ["npx", "wait-for-it", "postgres:5432", "--", "node", "dist/server.js"]
