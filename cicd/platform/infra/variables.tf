variable "project_id" {
  type        = string
  description = "GCP project ID for this environment"
}

variable "app_name" {
  type    = string
  default = "servio"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "environment" {
  type        = string
  description = "Environment name (staging or production)"
}

variable "github_org" {
  type        = string
  default     = "priosshrsth"
  description = "GitHub org or username"
}

variable "github_repo" {
  type        = string
  default     = "elysia-trial"
  description = "GitHub repository name (without org)"
}

variable "cloud_sql_tier" {
  type    = string
  default = "db-f1-micro"
}

variable "redis_memory_size" {
  type    = number
  default = 1
}
