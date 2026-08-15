variable "environment" {}

resource "aws_secretsmanager_secret" "app_secrets" {
  name = "parkops-${var.environment}-secrets"
}

# The actual secret values should be managed outside of Terraform (e.g., manually in AWS Console)
# This resource just creates the secret container.

output "secrets_arn" {
  value = aws_secretsmanager_secret.app_secrets.arn
}
