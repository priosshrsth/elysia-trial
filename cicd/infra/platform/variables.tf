variable "project_id" {
  type        = string
  description = "GCP project ID (single project for all environments)"
}

variable "app_name" {
  type    = string
  default = "elysia"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "billing_account" {
  type      = string
  sensitive = true
}

variable "budget_amount" {
  type        = number
  default     = 50
  description = "Monthly budget in USD"
}

variable "budget_alert_emails" {
  type    = list(string)
  default = []
}

variable "github_org" {
  type        = string
  description = "GitHub org or username"
}

variable "github_repo" {
  type        = string
  description = "GitHub repository name (without org)"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "vm_machine_type" {
  type    = string
  default = "e2-small"
}

variable "environments" {
  type    = list(string)
  default = ["prod", "staging"]
}
