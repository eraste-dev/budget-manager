# Budget Manager - Docker Commands
# ================================

.PHONY: help build up down restart logs shell mysql redis clean dev-up dev-down

# Default target
help:
	@echo "Budget Manager - Docker Commands"
	@echo "================================="
	@echo ""
	@echo "Production:"
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start all containers"
	@echo "  make down       - Stop all containers"
	@echo "  make restart    - Restart all containers"
	@echo "  make logs       - View logs (follow mode)"
	@echo "  make shell      - Open shell in app container"
	@echo ""
	@echo "Development (DB only):"
	@echo "  make dev-up     - Start MySQL, phpMyAdmin, Redis only"
	@echo "  make dev-down   - Stop development containers"
	@echo ""
	@echo "Database:"
	@echo "  make mysql      - Open MySQL CLI"
	@echo "  make migrate    - Run migrations"
	@echo "  make seed       - Run seeders"
	@echo "  make fresh      - Fresh migrate with seed"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean      - Remove all containers and volumes"
	@echo "  make prune      - Remove unused Docker resources"
	@echo ""
	@echo "Ports:"
	@echo "  App:        http://localhost:8089"
	@echo "  phpMyAdmin: http://localhost:8891"
	@echo "  MySQL:      localhost:33069"
	@echo "  Redis:      localhost:63799"

# ===================
# Production Commands
# ===================

# Build frontend assets locally first, then build Docker image
build:
	@echo "Building frontend assets..."
	npm run build
	@echo "Building Docker image..."
	docker compose build

# Build without cache (full rebuild)
build-fresh:
	npm run build
	docker compose build --no-cache

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

shell:
	docker compose exec app sh

# ===================
# Development Commands
# ===================

dev-up:
	docker compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "Development services started!"
	@echo "  phpMyAdmin: http://localhost:8891"
	@echo "  MySQL:      localhost:33069"
	@echo "  Redis:      localhost:63799"
	@echo ""
	@echo "Update your .env file:"
	@echo "  DB_HOST=127.0.0.1"
	@echo "  DB_PORT=33069"
	@echo "  REDIS_HOST=127.0.0.1"
	@echo "  REDIS_PORT=63799"

dev-down:
	docker compose -f docker-compose.dev.yml down

# ===================
# Database Commands
# ===================

mysql:
	docker compose exec mysql mysql -u budget_user -psecret_password budget_manager

migrate:
	docker compose exec app php artisan migrate

seed:
	docker compose exec app php artisan db:seed

fresh:
	docker compose exec app php artisan migrate:fresh --seed

# ===================
# Maintenance Commands
# ===================

clean:
	docker compose down -v --remove-orphans
	docker compose -f docker-compose.dev.yml down -v --remove-orphans

prune:
	docker system prune -af --volumes

# ===================
# Artisan Commands
# ===================

artisan:
	docker compose exec app php artisan $(filter-out $@,$(MAKECMDGOALS))

cache-clear:
	docker compose exec app php artisan cache:clear
	docker compose exec app php artisan config:clear
	docker compose exec app php artisan route:clear
	docker compose exec app php artisan view:clear

optimize:
	docker compose exec app php artisan optimize

# Catch-all target for artisan commands
%:
	@:
