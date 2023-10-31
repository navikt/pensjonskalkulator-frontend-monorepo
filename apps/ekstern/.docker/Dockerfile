FROM nginxinc/nginx-unprivileged

ENV NGINX_ENVSUBST_OUTPUT_DIR /tmp
ENV TZ="Europe/Oslo"

COPY .nginx/nginx-conf-overwrite.conf /etc/nginx/conf.d/default.conf

COPY /dist /usr/share/nginx/html

# Will extract environment variables before nginx starts (ref. https://hub.docker.com/_/nginx):
COPY .nginx/nginx.conf /etc/nginx/templates/default.conf.template
