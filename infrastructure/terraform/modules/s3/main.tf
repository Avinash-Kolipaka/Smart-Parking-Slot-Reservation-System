variable "environment" {}

resource "aws_s3_bucket" "frontend" {
  bucket = "parkops-frontend-${var.environment}"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_id" {
  value = aws_s3_bucket.frontend.id
}
output "bucket_arn" {
  value = aws_s3_bucket.frontend.arn
}
output "bucket_regional_domain_name" {
  value = aws_s3_bucket.frontend.bucket_regional_domain_name
}
