data "aws_iam_policy_document" "application_role_trust" {
  statement {
    sid    = "AllowEC2AssumeRole"
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

resource "aws_iam_role" "application" {
  name = var.application_role_name

  description = "Runtime IAM role for the CloudDrop production application."

  assume_role_policy = data.aws_iam_policy_document.application_role_trust.json
}

data "aws_iam_policy_document" "application_permissions" {
  statement {
    sid    = "ManagedStorageBucketAccess"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]

    resources = [
      aws_s3_bucket.managed.arn
    ]
  }

  statement {
    sid    = "ManagedStorageObjectAccess"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]

    resources = [
      "${aws_s3_bucket.managed.arn}/*"
    ]
  }

  statement {
    sid    = "ReadDatabaseSecret"
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]

    resources = [
      aws_db_instance.database.master_user_secret[0].secret_arn
    ]
  }

  statement {
    sid    = "AssumeCustomerCloudDropRoles"
    effect = "Allow"

    actions = [
      "sts:AssumeRole"
    ]

    resources = [
      "arn:aws:iam::*:role/*CloudDropAccessRole*"
    ]
  }
}

resource "aws_iam_role_policy" "application" {
  name = "CloudDropApplicationRuntimePolicy"
  role = aws_iam_role.application.id

  policy = data.aws_iam_policy_document.application_permissions.json
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role = aws_iam_role.application.name

  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "application" {
  name = "CloudDropApplicationInstanceProfile"
  role = aws_iam_role.application.name
}
