resource "aws_security_group" "application" {
  name        = "${local.name_prefix}-application-sg"
  description = "Security group for the CloudDrop production application."
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${local.name_prefix}-application-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "application_http" {
  security_group_id = aws_security_group.application.id

  description = "Allow public HTTP traffic."

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 80
  to_port     = 80
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "application_https" {
  security_group_id = aws_security_group.application.id

  description = "Allow public HTTPS traffic."

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 443
  to_port     = 443
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "application_outbound" {
  security_group_id = aws_security_group.application.id

  description = "Allow application outbound traffic."

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}

resource "aws_security_group" "database" {
  name        = "${local.name_prefix}-database-sg"
  description = "Security group for the CloudDrop PostgreSQL database."
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${local.name_prefix}-database-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "database_postgresql" {
  security_group_id = aws_security_group.database.id

  description = "Allow PostgreSQL only from the CloudDrop application."

  referenced_security_group_id = aws_security_group.application.id

  from_port   = 5432
  to_port     = 5432
  ip_protocol = "tcp"
}
