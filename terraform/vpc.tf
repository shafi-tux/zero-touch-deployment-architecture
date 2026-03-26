resource "aws_vpc" "custom" {
	cidr_block = "10.0.0.0/16"
	enable_dns_hostnames = true
	
	tags = {
		Name = "production_vpc"
	}
}

resource "aws_subnet" "public_subnet" {
	cidr_block = "10.0.1.0/24"
	map_public_ip_on_launch = true
	vpc_id = aws_vpc.custom.id
	availability_zone = "us-east-1a"	
	tags = {
		Name = "public_subnet"
	}
}

resource "aws_subnet" "private_subnet" {
	cidr_block = "10.0.2.0/24"
	map_public_ip_on_launch = false
	vpc_id = aws_vpc.custom.id
	availability_zone = "us-east-1a"
	tags = {
		Name = "private_subnet"
	}
}

resource "aws_eip" "nat_eip" {
	tags = {
		Name = "elastic_ip_nat"
	}
	domain = "vpc"
}
	
resource "aws_nat_gateway" "public_nat" {
	allocation_id = aws_eip.nat_eip.id
	subnet_id = aws_subnet.public_subnet.id
	tags = {
		Name = "nat gw"
	}
	depends_on = [aws_internet_gateway.igw]
}

resource "aws_route_table" "nat_rt" {
	vpc_id = aws_vpc.custom.id
	route {
		cidr_block = "0.0.0.0/0"
		nat_gateway_id = aws_nat_gateway.public_nat.id
	}
}

resource "aws_route_table_association" "nat_rt_assoc" {
	subnet_id = aws_subnet.private_subnet.id
	route_table_id = aws_route_table.nat_rt.id
}	


resource "aws_internet_gateway" "igw" {
	vpc_id = aws_vpc.custom.id

	tags = {
		Name = "production-igw"
	}
}

resource "aws_route_table" "public_rt" {
	vpc_id = aws_vpc.custom.id
	
	route {
		cidr_block = "0.0.0.0/0"      
		gateway_id = aws_internet_gateway.igw.id
	}
	
	tags = {
		Name = "public-route-table"
	}

}


resource "aws_route_table_association" "publicassoc" {
	subnet_id = aws_subnet.public_subnet.id
	route_table_id = aws_route_table.public_rt.id
}


