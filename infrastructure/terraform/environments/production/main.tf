terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" { default = "us-east-1" }
variable "environment" { default = "production" }
variable "api_image" { default = "nginx:latest" } # Replaced by CI/CD
variable "worker_image" { default = "nginx:latest" } # Replaced by CI/CD
variable "certificate_arn" { default = "" }
variable "domain_name" { default = "" }

module "networking" {
  source      = "../../modules/networking"
  environment = var.environment
  vpc_cidr    = "10.0.0.0/16"
  azs         = ["${var.aws_region}a", "${var.aws_region}b"]
}

module "iam" {
  source      = "../../modules/iam"
  environment = var.environment
  secrets_arn = module.secrets.secrets_arn
}

module "secrets" {
  source      = "../../modules/secrets"
  environment = var.environment
}

module "alb" {
  source            = "../../modules/alb"
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
  certificate_arn   = var.certificate_arn
}

module "ecs" {
  source               = "../../modules/ecs"
  environment          = var.environment
  vpc_id               = module.networking.vpc_id
  private_subnet_ids   = module.networking.private_subnet_ids
  alb_sg_id            = module.alb.alb_sg_id
  api_target_group_arn = module.alb.api_target_group_arn
  execution_role_arn   = module.iam.ecs_execution_role_arn
  task_role_arn        = module.iam.ecs_task_role_arn
  secrets_arn          = module.secrets.secrets_arn
  api_image            = var.api_image
  worker_image         = var.worker_image
}

module "ecr" {
  source      = "../../modules/ecr"
  environment = var.environment
}

module "s3" {
  source      = "../../modules/s3"
  environment = var.environment
}

module "cloudfront" {
  source                      = "../../modules/cloudfront"
  environment                 = var.environment
  bucket_id                   = module.s3.bucket_id
  bucket_arn                  = module.s3.bucket_arn
  bucket_regional_domain_name = module.s3.bucket_regional_domain_name
  certificate_arn             = var.certificate_arn
  domain_name                 = var.domain_name
}

# Redis isn't free, but needed per requirements.
# module "redis" {
#   source             = "../../modules/redis"
#   environment        = var.environment
#   vpc_id             = module.networking.vpc_id
#   private_subnet_ids = module.networking.private_subnet_ids
#   ecs_sg_id          = module.alb.alb_sg_id
# }
