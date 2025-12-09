#!/bin/sh
set -e

echo "🚀 Starting Budget Manager..."

# Create log directory for supervisor
mkdir -p /var/log/supervisor

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL..."
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
    echo "MySQL is unavailable - sleeping"
    sleep 2
done
echo "✅ MySQL is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
until redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} ping 2>/dev/null | grep -q PONG; do
    echo "Redis is unavailable - sleeping"
    sleep 2
done
echo "✅ Redis is ready!"

# Generate application key if not exists
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Clear and cache configuration
echo "🔧 Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
echo "📦 Running migrations..."
php artisan migrate --force

# Create storage link if not exists
if [ ! -L "/var/www/html/public/storage" ]; then
    echo "🔗 Creating storage link..."
    php artisan storage:link
fi

# Ensure correct permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "✨ Budget Manager is ready!"

# Execute the main command
exec "$@"
