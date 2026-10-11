output "application_instance_id" {
  description = "CloudDrop production EC2 instance ID."
  value       = aws_instance.application.id
}

output "application_public_ip" {
  description = "Static public IPv4 address for CloudDrop."
  value       = aws_eip.application.public_ip
}

output "managed_s3_bucket" {
  description = "CloudDrop managed-storage S3 bucket."
  value       = aws_s3_bucket.managed.bucket
}

output "database_endpoint" {
  description = "Private PostgreSQL RDS endpoint."
  value       = aws_db_instance.database.endpoint
}

output "database_secret_arn" {
  description = "Secrets Manager ARN containing the RDS master credentials."
  value       = aws_db_instance.database.master_user_secret[0].secret_arn
}

output "application_role_arn" {
  description = "Production CloudDrop application IAM role."
  value       = aws_iam_role.application.arn
}

output "vpc_id" {
  description = "CloudDrop production VPC ID."
  value       = aws_vpc.main.id
}
