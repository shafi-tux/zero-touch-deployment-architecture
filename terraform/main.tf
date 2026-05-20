terraform {
	required_providers {
		aws = {
			version = "~> 6.0"
			source = "hashicorp/aws"
		}
	}
	backend "s3" {
		bucket = "sb-660348065846-us-east-1-an"
		key = "network-segmentation/terraform.tfstate"
		region = "us-east-1"
		use_lockfile = true
		encrypt = true
	}
}

provider "aws" {
	region = var.aws_region
}

data "aws_ami" "ubuntu" {
	most_recent = true
	owners = ["099720109477"]

	filter {
		name = "name"
		values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
	}
}

resource "aws_key_pair" "webserverkeys" {
	key_name = "server_ssh_keys"
	public_key = file("~/.ssh/aws_ec2_key.pub")
}

resource "aws_instance" "ubuntuserver" {
	ami = data.aws_ami.ubuntu.id
	instance_type = var.instance_size
	key_name = aws_key_pair.webserverkeys.id
	subnet_id = aws_subnet.public_subnet.id
	vpc_security_group_ids = [aws_security_group.server_sg.id]	
	tags = {
		Name = "prod-server"
	}
	user_data = file("server_setup.sh")
}

resource "aws_instance" "dbserver" {
	ami = data.aws_ami.ubuntu.id
	instance_type = var.instance_size
	subnet_id = aws_subnet.private_subnet.id
	key_name = aws_key_pair.webserverkeys.id
	vpc_security_group_ids = [aws_security_group.database_sg.id]
	tags = {
		Name = "database-server"
	}
	user_data = file("db_setup.sh")
}

resource "aws_eip" "static_ip" {
	domain = "vpc"

	instance = aws_instance.ubuntuserver.id
	depends_on = [aws_internet_gateway.igw]
}
