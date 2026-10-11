resource "aws_security_group" "app" {
  name        = "${var.project_name}-sg"
  description = "AzureDrop production security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH administration"

    from_port = 22
    to_port   = 22
    protocol  = "tcp"

    cidr_blocks = [
      var.ssh_allowed_cidr
    ]
  }

  ingress {
    description = "HTTP"

    from_port = 80
    to_port   = 80
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  ingress {
    description = "HTTPS"

    from_port = 443
    to_port   = 443
    protocol  = "tcp"

    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"

    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}
