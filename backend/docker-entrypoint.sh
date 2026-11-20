#!/bin/sh
set -e

echo ">>> Validating database connection..."
DB_CONNECTION="${DB_CONNECTION:-}"
if [ -z "$DB_CONNECTION" ] || [ "$DB_CONNECTION" = "sqlite" ]; then
    echo "ERROR: DB_CONNECTION must be set to 'pgsql' or 'mysql' on Render. Refusing to fall back to SQLite."
    exit 1
fi

echo ">>> Caching configuration and routes..."
php artisan config:cache
php artisan route:cache

echo ">>> Running database migrations..."
php artisan migrate --force

if [ "$RUN_SEED" = "true" ]; then
    echo ">>> Seeding database..."
    php artisan db:seed --force
fi

echo ">>> Linking storage..."
php artisan storage:link || true

echo ">>> Fixing storage permissions..."
chown -R www-data:www-data storage bootstrap/cache

echo ">>> Starting Apache..."
exec "$@"
