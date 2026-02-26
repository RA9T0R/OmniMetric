import boto3
import json
from botocore.exceptions import NoCredentialsError
from app.config import settings
import uuid

storage_client = boto3.client(
    's3',
    endpoint_url=settings.S3_ENDPOINT,
    aws_access_key_id=settings.AWS_ACCESS_KEY,
    aws_secret_access_key=settings.AWS_SECRET_KEY,
    config=boto3.session.Config(signature_version='s3v4')
)


def ensure_bucket_public():
    try:
        try:
            storage_client.head_bucket(Bucket=settings.S3_BUCKET)
        except:
            storage_client.create_bucket(Bucket=settings.S3_BUCKET)

        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicRead",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{settings.S3_BUCKET}/*"]
                }
            ]
        }

        storage_client.put_bucket_policy(
            Bucket=settings.S3_BUCKET,
            Policy=json.dumps(policy)
        )

    except Exception as e:
        print(f"Failed to set bucket policy: {e}")


def upload_file(file, folder="avatars", user_id: str = None, project_id: str = None) -> str | None:
    ensure_bucket_public()

    try:
        if user_id and project_id:
            new_filename = f"projects/{user_id}/{project_id}/{file.filename}"

        else:
            file_extension = file.filename.split(".")[-1]
            new_filename = f"{folder}/{uuid.uuid4()}.{file_extension}"

        file.file.seek(0)

        storage_client.upload_fileobj(
            file.file,
            settings.S3_BUCKET,
            new_filename,
            ExtraArgs={'ContentType': file.content_type}
        )

        public_endpoint = settings.S3_PUBLIC_URL
        return f"{public_endpoint}/{settings.S3_BUCKET}/{new_filename}"

    except Exception as e:
        print(f"Error uploading file: {e}")
        return None


def delete_file(file_url: str) -> bool:
    try:
        if settings.S3_BUCKET not in file_url:
            return False

        file_key = file_url.split(f"/{settings.S3_BUCKET}/")[-1]

        storage_client.delete_object(Bucket=settings.S3_BUCKET, Key=file_key)
        print(f"Deleted file: {file_key}")
        return True

    except Exception as e:
        print(f"Error deleting file: {e}")
        return False