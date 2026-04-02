"""S3-compatible storage client wrapping boto3."""

from __future__ import annotations

import uuid
from io import BytesIO
from typing import BinaryIO

import boto3
import structlog
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError

from src.config import Settings, get_settings

logger = structlog.get_logger()


class StorageClient:
    """Thin wrapper around an S3-compatible object store (e.g. MinIO).

    Provides upload, download, deletion and pre-signed URL generation.
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client = boto3.client(
            "s3",
            endpoint_url=self._settings.S3_ENDPOINT,
            aws_access_key_id=self._settings.S3_ACCESS_KEY,
            aws_secret_access_key=self._settings.S3_SECRET_KEY,
            config=BotoConfig(signature_version="s3v4"),
            region_name="us-east-1",
        )
        self._bucket = self._settings.S3_BUCKET
        self._ensure_bucket()

    def _ensure_bucket(self) -> None:
        """Create the bucket if it does not already exist."""
        try:
            self._client.head_bucket(Bucket=self._bucket)
        except ClientError:
            self._client.create_bucket(Bucket=self._bucket)
            logger.info("storage.bucket_created", bucket=self._bucket)

    def upload(
        self,
        data: bytes | BinaryIO,
        key: str | None = None,
        *,
        content_type: str = "application/octet-stream",
        prefix: str = "",
    ) -> str:
        """Upload bytes or a file-like object and return the object key.

        If *key* is ``None`` a random UUID-based key is generated under *prefix*.
        """
        if key is None:
            key = f"{prefix}/{uuid.uuid4()}" if prefix else str(uuid.uuid4())

        body = data if isinstance(data, (bytes, BytesIO)) else data
        self._client.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=body,
            ContentType=content_type,
        )
        logger.info("storage.uploaded", key=key, content_type=content_type)
        return key

    def download(self, key: str) -> bytes:
        """Download an object and return its bytes."""
        try:
            response = self._client.get_object(Bucket=self._bucket, Key=key)
            return response["Body"].read()
        except ClientError as exc:
            logger.error("storage.download_failed", key=key, error=str(exc))
            raise

    def delete(self, key: str) -> None:
        """Delete an object by key."""
        self._client.delete_object(Bucket=self._bucket, Key=key)
        logger.info("storage.deleted", key=key)

    def generate_presigned_url(self, key: str, *, expires_in: int = 3600) -> str:
        """Generate a pre-signed GET URL valid for *expires_in* seconds."""
        url: str = self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": key},
            ExpiresIn=expires_in,
        )
        return url

    def generate_presigned_upload_url(
        self,
        key: str,
        *,
        content_type: str = "application/octet-stream",
        expires_in: int = 3600,
    ) -> str:
        """Generate a pre-signed PUT URL for direct client uploads."""
        url: str = self._client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self._bucket,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=expires_in,
        )
        return url
