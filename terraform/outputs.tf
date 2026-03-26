output "instance_public_ip" {
	description = "the public ip addr of the instance"
	value = aws_eip.static_ip.public_ip
}

output "db_instance_private_ip" {
	description = "the private ip of the database instance"
	value = aws_instance.dbserver.private_ip
}
