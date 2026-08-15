variable "environment" {}
variable "api_image" {}
variable "worker_image" {}
variable "vpc_id" {}
variable "private_subnet_ids" { type = list(string) }
variable "alb_sg_id" {}
variable "api_target_group_arn" {}
variable "execution_role_arn" {}
variable "task_role_arn" {}
variable "secrets_arn" {}

resource "aws_security_group" "ecs" {
  name        = "parkops-${var.environment}-ecs-sg"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [var.alb_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/parkops-api-${var.environment}"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/ecs/parkops-worker-${var.environment}"
  retention_in_days = 7
}

resource "aws_ecs_cluster" "main" {
  name = "parkops-${var.environment}-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "parkops-api-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name      = "api"
    image     = var.api_image
    essential = true
    
    portMappings = [{
      containerPort = 5000
      hostPort      = 5000
      protocol      = "tcp"
    }]
    
    environment = [
      { name = "NODE_ENV", value = var.environment },
      { name = "PORT", value = "5000" }
    ]
    
    secrets = [
      { name = "MONGO_URI", valueFrom = "${var.secrets_arn}:MONGO_URI::" },
      { name = "JWT_SECRET", valueFrom = "${var.secrets_arn}:JWT_SECRET::" },
      { name = "JWT_REFRESH_SECRET", valueFrom = "${var.secrets_arn}:JWT_REFRESH_SECRET::" },
      { name = "REDIS_URL", valueFrom = "${var.secrets_arn}:REDIS_URL::" }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "api" {
  name            = "parkops-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs.id]
    subnets          = var.private_subnet_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.api_target_group_arn
    container_name   = "api"
    container_port   = 5000
  }
}

resource "aws_ecs_task_definition" "worker" {
  family                   = "parkops-worker-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name      = "worker"
    image     = var.worker_image
    essential = true
    
    environment = [
      { name = "NODE_ENV", value = var.environment }
    ]
    
    secrets = [
      { name = "MONGO_URI", valueFrom = "${var.secrets_arn}:MONGO_URI::" },
      { name = "REDIS_URL", valueFrom = "${var.secrets_arn}:REDIS_URL::" }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.worker.name
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "worker" {
  name            = "parkops-worker-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs.id]
    subnets          = var.private_subnet_ids
    assign_public_ip = false
  }
}
