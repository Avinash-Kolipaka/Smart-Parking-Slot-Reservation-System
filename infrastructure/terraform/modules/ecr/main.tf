variable "environment" {}

resource "aws_ecr_repository" "api" {
  name                 = "parkops-backend-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "worker" {
  name                 = "parkops-worker-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

output "api_repository_url" {
  value = aws_ecr_repository.api.repository_url
}
output "worker_repository_url" {
  value = aws_ecr_repository.worker.repository_url
}
