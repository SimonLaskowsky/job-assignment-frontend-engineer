FROM mhart/alpine-node:14.17.3 AS build-env
WORKDIR /app
# Budujemy yarnem (zgodnie z yarn.lock + resolutions), tak samo jak lokalnie.
# npm ci dawał inne drzewo Babela -> błąd parsowania składni TypeScript przy buildzie.
ADD package.json yarn.lock ./
# --ignore-engines: niektóre transitywne paczki (np. node-releases) deklarują node>=18,
# ale to tylko dane i działają na Node 14 obrazu bazowego. Pomijamy nadgorliwą kontrolę.
RUN yarn install --frozen-lockfile --ignore-engines
ADD . .
RUN yarn build

FROM nginx:1.21.3-alpine AS production
ENV NODE_ENV=production
COPY --from=build-env /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
HEALTHCHECK --interval=1m --timeout=5s \
  CMD curl --head --fail http://localhost:80/ || exit 1
