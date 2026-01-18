#!/bin/bash

# =============================================================================
# Logistics AI Platform - Docker Management Script
# =============================================================================
# Usage:
#   ./start.sh start    - Start all services
#   ./start.sh stop     - Stop all services
#   ./start.sh restart  - Restart all services
#   ./start.sh clean    - Clean Docker cache and volumes
#   ./start.sh logs     - View logs from all services
#   ./start.sh status   - Check status of all services
#   ./start.sh build    - Build/rebuild all images
#   ./start.sh dev      - Start in development mode with live reload
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project name
PROJECT_NAME="logistics-ai-platform"

# Print banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║     🚚  LOGISTICS AI PLATFORM - Docker Manager  🚚           ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Print help
print_help() {
    echo -e "${YELLOW}Usage:${NC} ./start.sh [command]"
    echo ""
    echo -e "${GREEN}Commands:${NC}"
    echo "  start     Start all Docker services"
    echo "  stop      Stop all Docker services"
    echo "  restart   Restart all Docker services"
    echo "  build     Build/rebuild all Docker images"
    echo "  clean     Clean Docker cache, dangling images, and volumes"
    echo "  logs      View logs from all services (follow mode)"
    echo "  logs-all  View all logs without follow"
    echo "  status    Check status of all services"
    echo "  dev       Start in development mode"
    echo "  shell     Open shell in a service (e.g., ./start.sh shell backend)"
    echo "  db        Open PostgreSQL CLI"
    echo "  redis     Open Redis CLI"
    echo "  help      Show this help message"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./start.sh start"
    echo "  ./start.sh logs backend"
    echo "  ./start.sh shell frontend"
    echo ""
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Warning: .env file not found. Creating template...${NC}"
        cat > .env << EOF
# Mapbox API Token (get from https://mapbox.com)
MAPBOX_TOKEN=your_mapbox_token_here

# Google Gemini API Key (get from https://ai.google.dev)
GEMINI_API_KEY=your_gemini_api_key_here
EOF
        echo -e "${GREEN}Created .env template. Please update with your API keys.${NC}"
        echo ""
    fi
}

# Start services
start_services() {
    echo -e "${GREEN}🚀 Starting all services...${NC}"
    docker-compose up -d
    echo ""
    echo -e "${GREEN}✅ All services started successfully!${NC}"
    echo ""
    echo -e "${CYAN}Access points:${NC}"
    echo -e "  📱 Frontend:     ${BLUE}http://localhost:3000${NC}"
    echo -e "  🔧 Backend API:  ${BLUE}http://localhost:8000${NC}"
    echo -e "  📊 Neo4j:        ${BLUE}http://localhost:7474${NC}"
    echo -e "  🐘 PostgreSQL:   ${BLUE}localhost:5432${NC}"
    echo -e "  🔴 Redis:        ${BLUE}localhost:6379${NC}"
    echo ""
}

# Stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ All services stopped.${NC}"
}

# Restart services
restart_services() {
    echo -e "${YELLOW}🔄 Restarting all services...${NC}"
    docker-compose down
    docker-compose up -d
    echo -e "${GREEN}✅ All services restarted.${NC}"
}

# Build services
build_services() {
    echo -e "${BLUE}🔨 Building all Docker images...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ Build complete.${NC}"
}

# Clean Docker resources
clean_docker() {
    echo -e "${MAGENTA}🧹 Cleaning Docker resources...${NC}"
    echo ""
    
    # Stop containers
    echo -e "${YELLOW}Stopping containers...${NC}"
    docker-compose down -v --remove-orphans 2>/dev/null || true
    
    # Remove project containers
    echo -e "${YELLOW}Removing project containers...${NC}"
    docker-compose rm -f -s -v 2>/dev/null || true
    
    # Remove dangling images
    echo -e "${YELLOW}Removing dangling images...${NC}"
    docker image prune -f
    
    # Remove build cache
    echo -e "${YELLOW}Removing build cache...${NC}"
    docker builder prune -f
    
    # Remove unused volumes (optional - asks for confirmation)
    read -p "Remove unused volumes? This will delete database data! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Removing unused volumes...${NC}"
        docker volume prune -f
        
        # Remove project-specific volumes
        docker volume rm ${PROJECT_NAME}_postgres_data 2>/dev/null || true
        docker volume rm ${PROJECT_NAME}_redis_data 2>/dev/null || true
        docker volume rm ${PROJECT_NAME}_neo4j_data 2>/dev/null || true
    fi
    
    # Remove project networks
    echo -e "${YELLOW}Removing project networks...${NC}"
    docker network prune -f
    
    # Clean frontend cache
    if [ -d "frontend/.next" ]; then
        echo -e "${YELLOW}Removing Next.js cache...${NC}"
        rm -rf frontend/.next
    fi
    
    if [ -d "frontend/node_modules" ]; then
        read -p "Remove node_modules? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Removing node_modules...${NC}"
            rm -rf frontend/node_modules
        fi
    fi
    
    # Clean Python cache
    echo -e "${YELLOW}Removing Python cache...${NC}"
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    
    echo ""
    echo -e "${GREEN}✅ Cleanup complete!${NC}"
}

# View logs
view_logs() {
    local service=$1
    if [ -z "$service" ]; then
        echo -e "${CYAN}📋 Viewing logs for all services (Ctrl+C to exit)...${NC}"
        docker-compose logs -f
    else
        echo -e "${CYAN}📋 Viewing logs for $service (Ctrl+C to exit)...${NC}"
        docker-compose logs -f "$service"
    fi
}

# View all logs without follow
view_all_logs() {
    echo -e "${CYAN}📋 Viewing all logs...${NC}"
    docker-compose logs --tail=100
}

# Check status
check_status() {
    echo -e "${CYAN}📊 Service Status:${NC}"
    echo ""
    docker-compose ps
    echo ""
    
    # Check if services are healthy
    echo -e "${CYAN}🔍 Health Check:${NC}"
    
    # Frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "  Frontend:  ${GREEN}✅ Running${NC}"
    else
        echo -e "  Frontend:  ${RED}❌ Not responding${NC}"
    fi
    
    # Backend
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "  Backend:   ${GREEN}✅ Running${NC}"
    else
        echo -e "  Backend:   ${RED}❌ Not responding${NC}"
    fi
    
    # PostgreSQL
    if docker-compose exec -T postgres pg_isready > /dev/null 2>&1; then
        echo -e "  PostgreSQL: ${GREEN}✅ Running${NC}"
    else
        echo -e "  PostgreSQL: ${RED}❌ Not responding${NC}"
    fi
    
    # Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "  Redis:     ${GREEN}✅ Running${NC}"
    else
        echo -e "  Redis:     ${RED}❌ Not responding${NC}"
    fi
    
    echo ""
}

# Start in dev mode
dev_mode() {
    echo -e "${MAGENTA}🔧 Starting in development mode...${NC}"
    docker-compose up --build
}

# Open shell in service
open_shell() {
    local service=$1
    if [ -z "$service" ]; then
        echo -e "${RED}Error: Please specify a service (frontend, backend, simulation)${NC}"
        exit 1
    fi
    
    echo -e "${CYAN}🐚 Opening shell in $service...${NC}"
    
    case $service in
        frontend)
            docker-compose exec frontend sh
            ;;
        backend)
            docker-compose exec backend bash
            ;;
        simulation)
            docker-compose exec simulation bash
            ;;
        *)
            docker-compose exec "$service" sh
            ;;
    esac
}

# Open PostgreSQL CLI
open_db() {
    echo -e "${CYAN}🐘 Opening PostgreSQL CLI...${NC}"
    docker-compose exec postgres psql -U postgres -d logistics
}

# Open Redis CLI
open_redis() {
    echo -e "${CYAN}🔴 Opening Redis CLI...${NC}"
    docker-compose exec redis redis-cli
}

# Main script
main() {
    print_banner
    check_docker
    
    case "$1" in
        start)
            check_env
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        build)
            build_services
            ;;
        clean)
            clean_docker
            ;;
        logs)
            view_logs "$2"
            ;;
        logs-all)
            view_all_logs
            ;;
        status)
            check_status
            ;;
        dev)
            check_env
            dev_mode
            ;;
        shell)
            open_shell "$2"
            ;;
        db)
            open_db
            ;;
        redis)
            open_redis
            ;;
        help|--help|-h)
            print_help
            ;;
        "")
            print_help
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            echo ""
            print_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
