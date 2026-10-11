variable "project_name" {
  type    = string
  default = "azuredrop"
}

variable "location" {
  type    = string
  default = "West Europe"
}

variable "admin_username" {
  type    = string
  default = "azureuser"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key for the Azure VM"
}

variable "postgres_admin_username" {
  type    = string
  default = "azuredropadmin"
}

variable "postgres_admin_password" {
  type        = string
  sensitive   = true
  description = "PostgreSQL administrator password"
}

variable "tags" {
  type = map(string)

  default = {
    project     = "AzureDrop"
    environment = "production"
    managed_by  = "terraform"
  }
}
