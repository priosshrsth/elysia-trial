variable "project_id" {
  type = string
}

variable "environment" {
  type        = string
  description = "Environment name (staging or production)"
}

variable "region" {
  type    = string
  default = "us-central1"
}
