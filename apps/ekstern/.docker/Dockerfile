FROM nginxinc/nginx-unprivileged

ENV NGINX_ENVSUBST_OUTPUT_DIR /tmp

COPY /build /usr/share/nginx/html

# Will extract environment variables before nginx starts (ref. https://hub.docker.com/_/nginx):
COPY .nginx/nginx.conf /etc/nginx/templates/default.conf.template
