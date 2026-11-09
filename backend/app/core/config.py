from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "tpi115-app"
    node_id: str = "node-unknown"
    environment: str = "local"

    database_url: str = "postgresql+psycopg://tpi115:changeme@postgres:5432/tpi115"
    redis_url: str = "redis://redis:6379/0"

    session_ttl_seconds: int = 86400
    session_cookie_name: str = "tpi115_session"
    session_cookie_secure: bool = True

    oidc_issuer: str = ""
    oidc_client_id: str = ""
    oidc_audience: str = ""

    cdn_base_url: str = "/"
    cors_origins: str = "https://localhost"

    service_api_key: str = "changeme-service-key"
    external_api_timeout_seconds: float = 5.0
    external_apis: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
