data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  vpc_cidr = "10.50.0.0/16"

  public_subnet_cidr = "10.50.1.0/24"

  database_subnet_cidrs = [
    "10.50.11.0/24",
    "10.50.12.0/24"
  ]
}

resource "aws_vpc" "main" {
  cidr_block = local.vpc_cidr

  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${local.name_prefix}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${local.name_prefix}-igw"
  }
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id

  cidr_block = local.public_subnet_cidr

  availability_zone = data.aws_availability_zones.available.names[0]

  map_public_ip_on_launch = true

  tags = {
    Name = "${local.name_prefix}-public"
    Tier = "public"
  }
}

resource "aws_subnet" "database_a" {
  vpc_id = aws_vpc.main.id

  cidr_block = local.database_subnet_cidrs[0]

  availability_zone = data.aws_availability_zones.available.names[0]

  map_public_ip_on_launch = false

  tags = {
    Name = "${local.name_prefix}-database-a"
    Tier = "database"
  }
}

resource "aws_subnet" "database_b" {
  vpc_id = aws_vpc.main.id

  cidr_block = local.database_subnet_cidrs[1]

  availability_zone = data.aws_availability_zones.available.names[1]

  map_public_ip_on_launch = false

  tags = {
    Name = "${local.name_prefix}-database-b"
    Tier = "database"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${local.name_prefix}-public-rt"
  }
}

resource "aws_route" "public_internet" {
  route_table_id = aws_route_table.public.id

  destination_cidr_block = "0.0.0.0/0"

  gateway_id = aws_internet_gateway.main.id
}

resource "aws_route_table_association" "public" {
  subnet_id = aws_subnet.public.id

  route_table_id = aws_route_table.public.id
}
