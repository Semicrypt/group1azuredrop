data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "managed" {
  bucket = "${local.name_prefix}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name    = "${local.name_prefix}-managed-storage"
    Purpose = "CloudDrop managed file storage"
  }
}

resource "aws_s3_bucket_public_access_block" "managed" {
  bucket = aws_s3_bucket.managed.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "managed" {
  bucket = aws_s3_bucket.managed.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "managed" {
  bucket = aws_s3_bucket.managed.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "managed" {
  bucket = aws_s3_bucket.managed.id

  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "managed" {
  bucket = aws_s3_bucket.managed.id

  rule {
    id     = "abort-incomplete-multipart-uploads"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
