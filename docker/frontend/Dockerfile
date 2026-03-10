FROM nginx:1.27-alpine

COPY docker/frontend/default.conf /etc/nginx/templates/default.conf.template
COPY docker/frontend/site/ /usr/share/nginx/html/

EXPOSE 80
