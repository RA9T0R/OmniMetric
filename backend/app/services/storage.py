import boto3
import json  # <--- เพิ่ม import json
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

# ✅ ฟังก์ชันใหม่: ตั้งค่า Bucket ให้เป็น Public
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
        print(f"✅ Bucket '{settings.S3_BUCKET}' is now PUBLIC.")

    except Exception as e:
        print(f"⚠️ Failed to set bucket policy: {e}")


def upload_file(file, folder="avatars") -> str:
    # เรียกใช้ฟังก์ชันนี้ก่อนอัปโหลด (หรือจะย้ายไปเรียกตอนเริ่ม Server ใน main.py ก็ได้เพื่อความเร็ว)
    ensure_bucket_public()

    try:
        file_extension = file.filename.split(".")[-1]
        new_filename = f"{folder}/{uuid.uuid4()}.{file_extension}"

        storage_client.upload_fileobj(
            file.file,
            settings.S3_BUCKET,
            new_filename,
            ExtraArgs={'ContentType': file.content_type}
        )

        public_endpoint = "http://localhost:9000"
        return f"{public_endpoint}/{settings.S3_BUCKET}/{new_filename}"

    except Exception as e:
        print(f"Error uploading file: {e}")
        return None