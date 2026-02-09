import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "OmniMetric AI"
    VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    # MinIO / S3
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT_URL")
    S3_PUBLIC_URL: str = os.getenv("S3_PUBLIC_URL", S3_ENDPOINT)
    S3_BUCKET: str = os.getenv("S3_BUCKET_NAME")
    AWS_ACCESS_KEY: str = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY")

    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM")

    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

settings = Settings()