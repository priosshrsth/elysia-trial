variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "app_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "image" {
  type = string
}

variable "port" {
  type = number
}

variable "min_instances" {
  type    = number
  default = 0
}

variable "max_instances" {
  type    = number
  default = 1
}

variable "cpu" {
  type    = string
  default = "1"
}

variable "memory" {
  type    = string
  default = "512Mi"
}

variable "service_account" {
  type        = string
  description = "Service account email for the Cloud Run service"
}

variable "vpc_connector_id" {
  type        = string
  description = "VPC Access connector ID for private network access"
}

variable "allow_public_access" {
  type    = bool
  default = true
}

variable "env_vars" {
  type        = map(string)
  default     = {}
  description = "Plain environment variables"
}

variable "secret_env_vars" {
  type        = list(string)
  default     = []
  description = "Secret Manager secret names to mount as env vars (secret name = env var name)"
}

variable "command" {
  type        = list(string)
  default     = []
  description = "Optional container command override (ENTRYPOINT)"
}

variable "args" {
  type        = list(string)
  default     = []
  description = "Optional container args override (CMD)"
}
