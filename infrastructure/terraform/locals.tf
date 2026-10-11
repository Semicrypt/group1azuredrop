locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = "CloudDrop"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Application = "CloudDrop"
  }
}
