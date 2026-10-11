variable "project_name" {
  type    = string
  default = "azuredrop"
}

variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "ssh_public_key" {
  type        = string
  description = "Public SSH key used to access the EC2 instance"
}

variable "ssh_allowed_cidr" {
  type        = string
  description = "Public IPv4 CIDR allowed to SSH to AzureDrop"
}

variable "tags" {
  type = map(string)

  default = {
    Project     = "AzureDrop"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}
