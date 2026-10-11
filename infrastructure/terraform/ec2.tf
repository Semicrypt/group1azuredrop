resource "aws_instance" "application" {
  ami           = var.ec2_ami_id
  instance_type = var.ec2_instance_type

  subnet_id = aws_subnet.public.id

  vpc_security_group_ids = [
    aws_security_group.application.id
  ]

  iam_instance_profile = aws_iam_instance_profile.application.name

  associate_public_ip_address = true

  user_data = file("${path.module}/user-data.sh")

  root_block_device {
    volume_type = "gp3"
    volume_size = var.ec2_root_volume_size

    encrypted             = true
    delete_on_termination = true

    tags = {
      Name = "${local.name_prefix}-root"
    }
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"

    # Containers need one additional network hop to access
    # IAM role credentials through IMDSv2.
    http_put_response_hop_limit = 2
  }

  instance_initiated_shutdown_behavior = "stop"

  tags = {
    Name    = "${local.name_prefix}-application"
    Purpose = "CloudDrop production application host"
  }

  depends_on = [
    aws_internet_gateway.main,
    aws_route.public_internet
  ]
}

resource "aws_eip" "application" {
  domain = "vpc"

  tags = {
    Name = "${local.name_prefix}-eip"
  }
}

resource "aws_eip_association" "application" {
  instance_id   = aws_instance.application.id
  allocation_id = aws_eip.application.id
}
