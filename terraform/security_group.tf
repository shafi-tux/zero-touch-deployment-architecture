resource "aws_security_group" "server_sg" {
	name = "web_server_sg"
	description = "allow http and ssh"
	vpc_id = aws_vpc.custom.id

	#allow ssh traffic into the instance
	ingress {
		from_port = 22
		to_port = 22
		protocol = "tcp"
		cidr_blocks = ["0.0.0.0/0"]
	}
	#allow http traffic into the instance
	ingress {
		from_port = 80
		to_port = 80
		protocol = "tcp"
		cidr_blocks = ["0.0.0.0/0"]
	}
	#allow internet in the instance
	egress {
		from_port = 0
		to_port = 0
		protocol = "-1"
		cidr_blocks = ["0.0.0.0/0"]
	}
	
}

resource "aws_security_group" "database_sg" {
	name = "database_sg"
	description = "isolate the db in a private subnet"
	vpc_id = aws_vpc.custom.id
	
	ingress {
		from_port = 6379
		to_port = 6379
		protocol = "tcp"
		security_groups = [aws_security_group.server_sg.id]
	}
	#allow ssh login
	ingress {
		from_port = 22
		to_port = 22
		protocol = "tcp"
		security_groups = [aws_security_group.server_sg.id]
	}
		
	egress {
		from_port = 0
		to_port = 0
		protocol = "-1"
		cidr_blocks = ["0.0.0.0/0"]
	}
}
