#!/bin/sh
set -e

echo ">>> Caching configuration and routes..."
php artisan config:cache
php artisan route:cache

echo ">>> Running database migrations..."
php artisan migrate --force

echo ">>> Starting Apache..."
exec "$@"
