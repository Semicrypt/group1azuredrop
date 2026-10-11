data "aws_ami" "ubuntu" {
  most_recent = true

  owners = [
    "099720109477"
  ]

  filter {
    name = "name"

    values = [
      "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"
    ]
  }

  filter {
    name = "virtualization-type"

    values = [
      "hvm"
    ]
  }

  filter {
    name = "architecture"

    values = [
      "x86_64"
    ]
  }
}

resource "aws_key_pair" "app" {
  key_name   = "${var.project_name}-ec2-key"
  public_key = var.ssh_public_key

  tags = {
    Name = "${var.project_name}-ec2-key"
  }
}

resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id

  vpc_security_group_ids = [
    aws_security_group.app.id
  ]

  key_name = aws_key_pair.app.key_name

  iam_instance_profile = aws_iam_instance_profile.ec2_ssm.name

  associate_public_ip_address = false

  # The instance receives its stable public address from aws_eip.app.
  # Ignore provider drift on this ForceNew attribute so attaching the
  # SSM instance profile does not recreate the production server.
  lifecycle {
    ignore_changes = [
      associate_public_ip_address
    ]
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  user_data = file(
    "${path.module}/user-data.sh"
  )

  tags = {
    Name = "${var.project_name}-production"
  }
}

resource "aws_eip" "app" {
  domain   = "vpc"
  instance = aws_instance.app.id

  depends_on = [
    aws_internet_gateway.main
  ]

  tags = {
    Name = "${var.project_name}-public-ip"
  }
}
