#!/bin/bash

# Chil's Korean Store Deployment Script
# This script deploys the application to production

set -e

echo "🚀 Starting Chil's Korean Store Deployment..."

# Configuration
DOCKER_IMAGE="yourusername/chils-korean-store:latest"
DOMAIN="your-domain.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_info "Docker and Docker Compose are installed"
}

# Check environment file
check_env() {
    if [ ! -f ".env" ]; then
        log_warn ".env file not found. Creating from template..."
        cp .env.example .env
        log_error "Please edit .env file with your production values before continuing."
        exit 1
    fi
    
    log_info "Environment file found"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    mkdir -p uploads
    mkdir -p ssl
    mkdir -p logs
    
    # Set permissions
    chmod 755 uploads ssl logs
}

# Generate SSL certificate (self-signed for development, replace with Let's Encrypt for production)
generate_ssl() {
    if [ ! -f "ssl/cert.pem" ]; then
        log_warn "SSL certificate not found. Generating self-signed certificate..."
        log_warn "For production, use Let's Encrypt or a proper SSL certificate."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=PH/ST=Manila/L=Manila/O=Chil's Korean Store/CN=$DOMAIN"
    fi
}

# Pull latest image
pull_image() {
    log_info "Pulling latest Docker image..."
    docker pull $DOCKER_IMAGE
}

# Deploy application
deploy() {
    log_info "Deploying application..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down || true
    
    # Start new containers
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for containers to be ready
    sleep 10
    
    # Check if containers are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log_info "Deployment successful! 🎉"
        log_info "Application is running at: https://$DOMAIN"
    else
        log_error "Deployment failed. Check logs with: docker-compose -f docker-compose.prod.yml logs"
        exit 1
    fi
}

# Setup automatic renewals (for future use)
setup_cron() {
    log_info "Setting up automatic deployment..."
    
    # Create a cron job for weekly updates
    (crontab -l 2>/dev/null; echo "0 2 * * 0 cd $(pwd) && ./deploy.sh") | crontab -
    
    log_info "Cron job added for weekly updates"
}

# Main deployment flow
main() {
    log_info "Starting deployment process..."
    
    check_docker
    check_env
    create_directories
    generate_ssl
    pull_image
    deploy
    
    log_info "Deployment completed successfully! 🚀"
    log_info ""
    log_info "Next steps:"
    log_info "1. Update your DNS to point $DOMAIN to this server"
    log_info "2. Replace self-signed SSL with Let's Encrypt certificate"
    log_info "3. Set up monitoring and backups"
    log_info "4. Configure email and payment services"
}

# Run main function
main "$@"
