#!/bin/bash

# Docker management script for Next.js RAG application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_usage() {
    echo "Usage: $0 {dev|prod|build|logs|stop|clean|health}"
    echo ""
    echo "Commands:"
    echo "  dev     - Start development environment (with hot reload)"
    echo "  prod    - Start production environment"
    echo "  build   - Build the Next.js application"
    echo "  logs    - Show logs from all services"
    echo "  stop    - Stop all services"
    echo "  clean   - Stop and remove all containers, networks, and volumes"
    echo "  health  - Check health of running services"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
}

check_env_file() {
    if [ ! -f .env.local ]; then
        print_warning ".env.local file not found"
        if [ -f .env.local.example ]; then
            print_info "Copying .env.local.example to .env.local"
            cp .env.local.example .env.local
            print_warning "Please edit .env.local and add your API keys"
        else
            print_error ".env.local.example file not found"
            exit 1
        fi
    fi
}

dev() {
    print_info "Starting development environment..."
    check_env_file
    docker-compose up -d
    print_success "Development environment started!"
    print_info "Application: http://localhost:3000"
    print_info "Admin Panel: http://localhost:3000/admin"
    print_info "ChromaDB: http://localhost:8000"
}

prod() {
    print_info "Starting production environment..."
    check_env_file
    docker-compose -f docker-compose.prod.yaml up -d
    print_success "Production environment started!"
    print_info "Application: http://localhost:3000"
    print_info "Admin Panel: http://localhost:3000/admin"
}

build_app() {
    print_info "Building Next.js application..."
    docker-compose build nextjs-app
    print_success "Build completed!"
}

show_logs() {
    print_info "Showing logs from all services..."
    docker-compose logs -f
}

stop_services() {
    print_info "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.prod.yaml down 2>/dev/null || true
    print_success "All services stopped!"
}

clean_all() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down --volumes --remove-orphans
        docker-compose -f docker-compose.prod.yaml down --volumes --remove-orphans 2>/dev/null || true
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

health_check() {
    print_info "Checking health of services..."
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Containers are running"
        
        # Check application health
        if curl -f -s http://localhost:3000/api/health > /dev/null; then
            print_success "Next.js application is healthy"
        else
            print_error "Next.js application is not responding"
        fi
        
        # Check ChromaDB health
        if curl -f -s http://localhost:8000/api/v1/heartbeat > /dev/null; then
            print_success "ChromaDB is healthy"
        else
            print_error "ChromaDB is not responding"
        fi
    else
        print_error "No containers are running"
    fi
}

# Main script
check_docker

case "${1:-}" in
    dev)
        dev
        ;;
    prod)
        prod
        ;;
    build)
        build_app
        ;;
    logs)
        show_logs
        ;;
    stop)
        stop_services
        ;;
    clean)
        clean_all
        ;;
    health)
        health_check
        ;;
    *)
        print_usage
        exit 1
        ;;
esac
