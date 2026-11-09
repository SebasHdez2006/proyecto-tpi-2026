# Certificados TLS

Nginx espera `server.crt` y `server.key` en este directorio (montado en
`/etc/nginx/certs`). Si no existen, el contenedor genera un par **autofirmado**
al arrancar — suficiente para desarrollo, pero el navegador mostrará advertencia
y la PWA solo será instalable tras aceptarlo.

## Desarrollo local (recomendado: mkcert)

```sh
mkcert -install
mkcert -cert-file deploy/certs/server.crt -key-file deploy/certs/server.key localhost 127.0.0.1
```

Con mkcert el certificado es de confianza en la máquina y la PWA se instala
sin advertencias.

## Internet

Certificados de Let's Encrypt (certbot, acme.sh o el proxy que termine TLS).
Renovar y colocar aquí `server.crt` (fullchain) y `server.key`.

## Intranet (CA interna)

Generar la CA con `step-ca` u OpenSSL, firmar el cert del dominio interno y
**distribuir el certificado raíz a los dispositivos**:

- Android: Ajustes → Seguridad → Instalar certificado (CA).
- iOS: instalar perfil y habilitar confianza total en Ajustes → General → Información → Confianza de certificados.

Sin la CA raíz instalada, el smartphone no confiará en el sitio y el
Service Worker / la instalación PWA no funcionarán.
