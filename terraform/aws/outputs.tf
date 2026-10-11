output "instance_id" {
  value = aws_instance.app.id
}

output "public_ip" {
  value = aws_eip.app.public_ip
}

output "public_url" {
  value = "http://${aws_eip.app.public_ip}"
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/azuredrop_ec2 ubuntu@${aws_eip.app.public_ip}"
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "security_group_id" {
  value = aws_security_group.app.id
}

output "github_deploy_role_arn" {
  value = aws_iam_role.github_deploy.arn
}

output "ec2_ssm_instance_profile" {
  value = aws_iam_instance_profile.ec2_ssm.name
}
