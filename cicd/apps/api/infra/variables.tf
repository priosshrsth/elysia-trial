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

variable "email_from" {
  type    = string
  default = "noreply@servio.dev"
}

variable "extra_trusted_domains" {
  type        = list(string)
  default     = []
  description = "Additional CORS-allowed domains beyond the API Cloud Run URL (e.g. frontend URLs)"
}
