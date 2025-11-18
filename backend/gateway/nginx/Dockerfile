FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY ./services/gateway/nginx/nginx.conf /etc/nginx/conf.d/default.conf