variable "environment" {}
variable "vpc_id" {}
variable "private_subnet_ids" { type = list(string) }
variable "ecs_sg_id" {}

resource "aws_security_group" "redis" {
  name        = "parkops-${var.environment}-redis-sg"
  description = "Redis Security Group"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.ecs_sg_id]
  }
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "parkops-${var.environment}-redis-subnet"
  subnet_ids = var.private_subnet_ids
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "parkops-${var.environment}-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.1"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}
output "redis_port" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].port
}
