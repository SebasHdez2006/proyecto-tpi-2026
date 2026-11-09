#!/bin/sh
set -e
CERT_DIR=/etc/nginx/certs
if [ ! -f "$CERT_DIR/server.crt" ] || [ ! -f "$CERT_DIR/server.key" ]; then
    echo "[tls-init] No hay certificados en $CERT_DIR; generando autofirmado para ${DOMAIN:-localhost}"
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
        -keyout "$CERT_DIR/server.key" -out "$CERT_DIR/server.crt" \
        -subj "/CN=${DOMAIN:-localhost}" \
        -addext "subjectAltName=DNS:${DOMAIN:-localhost},DNS:localhost,IP:127.0.0.1"
fi
