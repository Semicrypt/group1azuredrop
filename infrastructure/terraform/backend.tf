terraform {
  backend "s3" {
    bucket       = "clouddrop-terraform-state-998361628336"
    key          = "production/terraform.tfstate"
    region       = "eu-north-1"
    encrypt      = true
    use_lockfile = true
  }
}
