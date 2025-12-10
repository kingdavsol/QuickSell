.PHONY: help install dev test build deploy clean

# Variables
DOCKER_REGISTRY := ghcr.io
PROJECT_NAME := quicksell
BACKEND_IMAGE := $(DOCKER_REGISTRY)/$(PROJECT_NAME)/backend
FRONTEND_IMAGE := $(DOCKER_REGISTRY)/$(PROJECT_NAME)/frontend
VERSION := 1.0.0

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

# Development
install: ## Install all dependencies
	cd backend && npm install
	cd frontend && npm install
	cd mobile && npm install

dev: ## Start development environment
	docker-compose up -d
	echo "✓ Development environment started"
	echo "  API: http://localhost:5000"
	echo "  Frontend: http://localhost:3000"
	echo "  pgAdmin: http://localhost:5050"
	echo "  Redis Commander: http://localhost:8081"

dev-down: ## Stop development environment
	docker-compose down

dev-logs: ## View development logs
	docker-compose logs -f

# Testing
test: ## Run all tests
	cd backend && npm test
	cd frontend && npm test
	cd mobile && npm test

test-backend: ## Run backend tests
	cd backend && npm test

test-frontend: ## Run frontend tests
	cd frontend && npm test

test-coverage: ## Run tests with coverage
	cd backend && npm run test:coverage

lint: ## Lint code
	cd backend && npm run lint
	cd frontend && npm run lint
	cd mobile && npm run lint

format: ## Format code
	cd backend && npm run format
	cd frontend && npm run format

# Building
build-backend: ## Build backend Docker image
	docker build -t $(BACKEND_IMAGE):$(VERSION) ./backend
	docker tag $(BACKEND_IMAGE):$(VERSION) $(BACKEND_IMAGE):latest

build-frontend: ## Build frontend
	cd frontend && npm run build

build-mobile-android: ## Build Android app
	cd mobile && eas build --platform android

build-mobile-ios: ## Build iOS app
	cd mobile && eas build --platform ios

build-all: build-backend build-frontend ## Build backend and frontend

# Docker
docker-push-backend: build-backend ## Push backend image to registry
	docker push $(BACKEND_IMAGE):$(VERSION)
	docker push $(BACKEND_IMAGE):latest

docker-push-all: docker-push-backend ## Push all images to registry

# Database
migrate: ## Run database migrations
	docker-compose exec backend npm run migrate

migrate-rollback: ## Rollback database migrations
	docker-compose exec backend npm run migrate:rollback

db-reset: ## Reset database (caution!)
	docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS quicksell;"
	docker-compose exec postgres psql -U postgres -c "CREATE DATABASE quicksell;"
	$(MAKE) migrate

db-seed: ## Seed database with sample data
	docker-compose exec backend npm run seed

# Deployment
deploy-backend: ## Deploy backend to production
	@echo "Deploying backend..."
	# Add your deployment command here
	# Example: yakit deploy $(BACKEND_IMAGE):$(VERSION) --env production

deploy-frontend: build-frontend ## Deploy frontend to production
	@echo "Deploying frontend..."
	aws s3 sync frontend/build s3://quicksell-frontend/ --delete

deploy-mobile-android: ## Submit Android app to Google Play
	cd mobile && eas submit --platform android --latest

deploy-mobile-ios: ## Submit iOS app to App Store
	cd mobile && eas submit --platform ios --latest

# Utility
clean: ## Clean up build artifacts
	rm -rf backend/dist
	rm -rf backend/node_modules
	rm -rf frontend/build
	rm -rf frontend/node_modules
	rm -rf mobile/node_modules
	docker-compose down -v

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-db: ## View database logs
	docker-compose logs -f postgres

logs-redis: ## View Redis logs
	docker-compose logs -f redis

shell-backend: ## Open backend shell
	docker-compose exec backend sh

shell-db: ## Open database shell
	docker-compose exec postgres psql -U postgres -d quicksell

version: ## Show version
	@echo "QuickSell v$(VERSION)"

health-check: ## Check health of services
	@echo "Checking services..."
	@curl -s http://localhost:5000/health > /dev/null && echo "✓ Backend API is healthy" || echo "✗ Backend API is down"
	@docker-compose exec postgres pg_isready > /dev/null 2>&1 && echo "✓ PostgreSQL is healthy" || echo "✗ PostgreSQL is down"
	@docker-compose exec redis redis-cli ping > /dev/null 2>&1 && echo "✓ Redis is healthy" || echo "✗ Redis is down"

# CI/CD
ci-test: test lint ## Run CI tests
	@echo "✓ All CI tests passed"

ci-build: build-all ## Build all artifacts for CI
	@echo "✓ All builds completed"

# Setup
setup: install ## Setup development environment
	cp .env.example .env
	$(MAKE) dev
	$(MAKE) migrate
	@echo "✓ Development environment setup complete"

# Monitoring
monitor-cpu: ## Monitor CPU usage
	docker-compose exec backend top

monitor-memory: ## Monitor memory usage
	docker stats

# Backup & Restore
backup-db: ## Backup database
	@mkdir -p ./backups
	docker-compose exec -T postgres pg_dump -U postgres quicksell > ./backups/quicksell_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✓ Database backed up"

restore-db: ## Restore database from backup
	@read -p "Enter backup file path: " backup_file; \
	docker-compose exec -T postgres psql -U postgres quicksell < $$backup_file
	@echo "✓ Database restored"

# Documentation
docs: ## Open documentation
	@echo "Opening documentation..."
	@open docs/GETTING_STARTED.md || xdg-open docs/GETTING_STARTED.md || echo "Please open docs/GETTING_STARTED.md manually"

# Release
release: ## Create a release
	@read -p "Enter version (current: $(VERSION)): " version; \
	git tag -a v$$version -m "Release v$$version"; \
	git push origin v$$version; \
	echo "✓ Release v$$version created"

.DEFAULT_GOAL := help
