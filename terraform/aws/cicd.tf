data "aws_caller_identity" "current" {}

# --------------------------------------------------
# GitHub Actions OIDC Provider
# --------------------------------------------------

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]
}

# --------------------------------------------------
# EC2 Role for AWS Systems Manager
# --------------------------------------------------

data "aws_iam_policy_document" "ec2_ssm_assume_role" {
  statement {
    effect = "Allow"

    actions = [
      "sts:AssumeRole"
    ]

    principals {
      type = "Service"

      identifiers = [
        "ec2.amazonaws.com"
      ]
    }
  }
}

resource "aws_iam_role" "ec2_ssm" {
  name = "${var.project_name}-ec2-ssm-role"

  assume_role_policy = data.aws_iam_policy_document.ec2_ssm_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ec2_ssm_core" {
  role = aws_iam_role.ec2_ssm.name

  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_ssm" {
  name = "${var.project_name}-ec2-ssm-profile"

  role = aws_iam_role.ec2_ssm.name
}

# --------------------------------------------------
# GitHub Actions Deployment Role
# --------------------------------------------------

locals {
  github_oidc_subject = "repo:Semicrypt@159531480/azuredrop@1402127588:ref:refs/heads/main"
}

data "aws_iam_policy_document" "github_deploy_assume_role" {
  statement {
    effect = "Allow"

    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]

    principals {
      type = "Federated"

      identifiers = [
        aws_iam_openid_connect_provider.github.arn
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"

      values = [
        "sts.amazonaws.com"
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"

      values = [
        local.github_oidc_subject
      ]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name = "${var.project_name}-github-deploy-role"

  assume_role_policy = data.aws_iam_policy_document.github_deploy_assume_role.json
}

# --------------------------------------------------
# Least-Privilege GitHub Deployment Permissions
# --------------------------------------------------

data "aws_iam_policy_document" "github_deploy_permissions" {
  statement {
    sid = "SendDeploymentCommand"

    effect = "Allow"

    actions = [
      "ssm:SendCommand"
    ]

    resources = [
      aws_instance.app.arn,
      "arn:aws:ssm:${var.aws_region}::document/AWS-RunShellScript"
    ]
  }

  statement {
    sid = "ReadDeploymentStatus"

    effect = "Allow"

    actions = [
      "ssm:GetCommandInvocation",
      "ssm:ListCommandInvocations",
      "ssm:DescribeInstanceInformation"
    ]

    resources = [
      "*"
    ]
  }
}

resource "aws_iam_policy" "github_deploy" {
  name = "${var.project_name}-github-deploy-policy"

  policy = data.aws_iam_policy_document.github_deploy_permissions.json
}

resource "aws_iam_role_policy_attachment" "github_deploy" {
  role = aws_iam_role.github_deploy.name

  policy_arn = aws_iam_policy.github_deploy.arn
}
