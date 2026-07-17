#!/bin/bash

# Railway provides a PORT env variable — Apache must listen on it
if [ ! -z "$PORT" ]; then
    sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf
    sed -i "s/:80/:$PORT/" /etc/apache2/sites-available/*.conf
fi

# Dynamically generate .env file using system env variables to ensure PHP can read them
echo "APP_NAME=Store" > /var/www/html/.env
echo "APP_ENV=production" >> /var/www/html/.env
echo "APP_KEY=base64:egS+g2OC0U8NaEgM19xPl8+KEpytaxjyhH0dmA8x2Yo=" >> /var/www/html/.env
echo "APP_DEBUG=${APP_DEBUG:-false}" >> /var/www/html/.env
echo "ALLOWED_CORS_ORIGINS=${ALLOWED_CORS_ORIGINS:-http://localhost:5173,http://localhost:3000,https://inspiredbynature.vercel.app}" >> /var/www/html/.env

DB_CONN="${DB_CONNECTION:-pgsql}"
echo "DB_CONNECTION=${DB_CONN}" >> /var/www/html/.env

# Map Railway's PostgreSQL env vars to Laravel's expected names
# Railway provides: DATABASE_URL, PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
if [ "$DB_CONN" = "sqlite" ]; then
    echo "DB_DATABASE=/var/www/html/database/database.sqlite" >> /var/www/html/.env
else
    echo "DB_HOST=${PGHOST:-${DB_HOST:-postgres}}" >> /var/www/html/.env
    echo "DB_PORT=${PGPORT:-${DB_PORT:-5432}}" >> /var/www/html/.env
    echo "DB_DATABASE=${PGDATABASE:-${DB_DATABASE:-inspiredbynature}}" >> /var/www/html/.env
    echo "DB_USERNAME=${PGUSER:-${DB_USERNAME:-postgres}}" >> /var/www/html/.env
    echo "DB_PASSWORD=${PGPASSWORD:-${DB_PASSWORD:-}}" >> /var/www/html/.env
fi

echo "SESSION_DRIVER=file" >> /var/www/html/.env
echo "CACHE_STORE=file" >> /var/www/html/.env


# Clear config and route cache so Laravel reads the dynamic .env at runtime
php /var/www/html/artisan config:clear || true
php /var/www/html/artisan route:clear || true
php /var/www/html/artisan cache:clear || true

# Run migrations on startup
php /var/www/html/artisan migrate --force || true

# Seed database if users table is empty
php -r "
    try {
        require 'vendor/autoload.php';
        \$app = require_once 'bootstrap/app.php';
        \$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
        \$kernel->bootstrap();
        if (Illuminate\Support\Facades\Schema::hasTable('users') && Illuminate\Support\Facades\DB::table('users')->count() === 0) {
            echo 'Database empty, seeding...';
            Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        }
    } catch (\Exception \$e) {
        echo 'Seed error: ' . \$e->getMessage();
    }
"

# Disable conflicting Apache MPM modules at runtime to avoid more than one MPM error
a2dismod mpm_event || true
a2dismod mpm_worker || true
a2enmod mpm_prefork || true
rm -f /etc/apache2/mods-enabled/mpm_event.load
rm -f /etc/apache2/mods-enabled/mpm_event.conf
rm -f /etc/apache2/mods-enabled/mpm_worker.load
rm -f /etc/apache2/mods-enabled/mpm_worker.conf

# Ensure storage, cache, and database folders have proper write permissions for Apache (www-data)
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database || true

# Start Apache
apache2-foreground
