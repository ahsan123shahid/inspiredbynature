from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/inspired_by_nature_v2"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "change-this-to-a-random-secret-key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    app_name: str = "Inspired by Nature"
    app_env: str = "development"
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    easypaisa_merchant_id: str = ""
    easypaisa_store_id: str = ""
    easypaisa_hash_key: str = ""
    easypaisa_sandbox: bool = True

    max_upload_size_mb: int = 10
    upload_dir: str = "uploads"

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
