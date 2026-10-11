variable "aws_region" {
  description = "AWS region used for CloudDrop production infrastructure."
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Project name used for AWS resource naming."
  type        = string
  default     = "clouddrop"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "production"
}

variable "application_role_name" {
  description = "IAM role assumed by the CloudDrop EC2 instance."
  type        = string
  default     = "CloudDropApplicationRole"
}

variable "db_name" {
  description = "Initial PostgreSQL database name."
  type        = string
  default     = "clouddrop"
}

variable "db_master_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "clouddropadmin"
}

variable "db_engine_version" {
  description = "PostgreSQL engine version."
  type        = string
  default     = "17.11"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "RDS storage allocation in GiB."
  type        = number
  default     = 20
}

variable "ec2_instance_type" {
  description = "EC2 instance type for the CloudDrop application host."
  type        = string
  default     = "t4g.small"
}

variable "ec2_ami_id" {
  description = "Pinned Ubuntu 24.04 ARM64 AMI for the CloudDrop application host."
  type        = string
  default     = "ami-0fa156f9d99979afc"
}

variable "ec2_root_volume_size" {
  description = "Root EBS volume size for the application server in GiB."
  type        = number
  default     = 20
}
