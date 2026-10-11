resource "aws_db_subnet_group" "database" {
  name = "${local.name_prefix}-db-subnet-group"

  subnet_ids = [
    aws_subnet.database_a.id,
    aws_subnet.database_b.id
  ]

  tags = {
    Name = "${local.name_prefix}-db-subnet-group"
  }
}

resource "aws_db_instance" "database" {
  identifier = "${local.name_prefix}-postgres"

  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  db_name  = var.db_name
  username = var.db_master_username

  manage_master_user_password = true

  port = 5432

  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  db_subnet_group_name = aws_db_subnet_group.database.name

  vpc_security_group_ids = [
    aws_security_group.database.id
  ]

  publicly_accessible = false
  multi_az            = false

  backup_retention_period = 1

  auto_minor_version_upgrade  = true
  allow_major_version_upgrade = false

  performance_insights_enabled = false
  monitoring_interval          = 0

  deletion_protection = false

  skip_final_snapshot      = true
  delete_automated_backups = true
  copy_tags_to_snapshot    = true

  tags = {
    Name    = "${local.name_prefix}-postgres"
    Purpose = "CloudDrop production PostgreSQL database"
  }
}
