#!/bin/sh
set -e

echo ">>> Installing Composer dependencies..."
composer install --no-interaction --prefer-dist

echo ">>> Running database migrations..."
php artisan migrate --force

echo ">>> Starting PHP-FPM..."
exec "$@"
