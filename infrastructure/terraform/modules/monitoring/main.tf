variable "environment" {}
variable "alb_arn_suffix" {}
variable "api_target_group_arn_suffix" {}
variable "sns_topic_arn" { default = "" }

resource "aws_cloudwatch_metric_alarm" "high_5xx" {
  alarm_name          = "parkops-${var.environment}-high-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This alarm triggers when 5XX errors exceed 10 in 2 minutes"
  
  dimensions = {
    TargetGroup  = var.api_target_group_arn_suffix
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
}

resource "aws_cloudwatch_metric_alarm" "high_latency" {
  alarm_name          = "parkops-${var.environment}-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "2"
  alarm_description   = "This alarm triggers when average latency exceeds 2s in 2 minutes"
  
  dimensions = {
    TargetGroup  = var.api_target_group_arn_suffix
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
}
