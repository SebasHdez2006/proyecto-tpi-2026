FROM node:22-alpine AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
ARG VITE_API_BASE=/api
ARG VITE_CDN_BASE_URL=/
ENV VITE_API_BASE=$VITE_API_BASE VITE_CDN_BASE_URL=$VITE_CDN_BASE_URL
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache openssl
COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/docker-entrypoint.sh /docker-entrypoint.d/99-tls.sh
RUN chmod +x /docker-entrypoint.d/99-tls.sh
COPY --from=frontend-build /build/dist /usr/share/nginx/html
EXPOSE 80 443
