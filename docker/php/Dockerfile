FROM php:8.4-rc-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev supervisor \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./laravel-worker.conf /etc/supervisor/conf.d/laravel-worker.conf
COPY ./laravel-fpm.conf /etc/supervisor/conf.d/laravel-fpm.conf

RUN mkdir -p /var/www/storage/logs/

WORKDIR /var/www

CMD ["/usr/bin/supervisord", "-n"]
