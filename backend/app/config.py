import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "OmniMetric AI"
    VERSION: str = "1.0.0"

    FRONTEND_URL: str = os.getenv("FRONTEND_URL")
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

    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

    PRICING = {
        "models": {
            "ProTypeModel": 10,
            "FastTypeModel": 5
        },
        "inputs": {
            "360_degree": 5,
            "Normal": 2
        }
    }

    STRIPE_PACKAGES = {
        "mini": {
            "name": "MiniPack",
            "tokens": 300,
            "price_thb": 39,
            "price_satang": 3900,
        },
        "starter": {
            "name": "StarterPack",
            "tokens": 650,
            "price_thb": 79,
            "price_satang": 7900,
        },
        "standard": {
            "name": "StandardPack",
            "tokens": 1500,
            "price_thb": 149,
            "price_satang": 14900,
        },
        "pro": {
            "name": "ProPack",
            "tokens": 3500,
            "price_thb": 299,
            "price_satang": 29900,
        },
        "power": {
            "name": "PowerPack",
            "tokens": 12500,
            "price_thb": 899,
            "price_satang": 89900,
        }
    }

settings = Settings()

