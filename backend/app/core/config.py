from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Application
    app_name: str = "Logistics AI Platform"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/logistics"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # Neo4j
    neo4j_url: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password123"
    
    # Gemini API
    gemini_api_key: Optional[str] = None
    
    # Dubai coordinates (default location)
    default_lat: float = 25.2048
    default_lng: float = 55.2708
    
    # Simulation settings
    num_vehicles: int = 25
    num_deliveries_per_day: int = 150
    position_update_interval: float = 2.0  # seconds
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
