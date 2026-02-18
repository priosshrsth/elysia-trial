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
  default     = "your-github-org"
  description = "GitHub org or username"
}

variable "github_repo" {
  type        = string
  default     = "servio"
  description = "GitHub repository name (without org)"
}

variable "vm_machine_type" {
  type    = string
  default = "e2-micro"
}

variable "use_managed_db" {
  type        = bool
  default     = false
  description = "Use Cloud SQL instead of VM-hosted PostgreSQL"
}

variable "use_managed_redis" {
  type        = bool
  default     = false
  description = "Use Memorystore Redis instead of VM-hosted Dragonfly"
}

variable "cloud_sql_tier" {
  type    = string
  default = "db-f1-micro"
}

variable "redis_memory_size" {
  type    = number
  default = 1
}
