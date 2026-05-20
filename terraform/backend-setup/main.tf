terraform {
	required_providers {
		aws = {
			source = "hashicorp/aws"
			version = "~> 6.0"
		}
	}
}

provider "aws" {
	region = "us-east-1"
	}

data "aws_caller_identity" "current"{}
data "aws_region" "current" {}

resource "aws_s3_bucket" "statebucket" {
	bucket = format("sb-%s-%s-an", data.aws_caller_identity.current.account_id, data.aws_region.current.id)
	bucket_namespace = "account-regional"
}

resource "aws_s3_bucket_versioning" "sb_versioning" {
	bucket = aws_s3_bucket.statebucket.id
	versioning_configuration {
		status = "Enabled"
	}
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sb_encrypt" {
	bucket = aws_s3_bucket.statebucket.id
	rule {
		apply_server_side_encryption_by_default {
			sse_algorithm = "AES256"
		}
	}
}
