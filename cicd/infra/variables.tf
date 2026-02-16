variable "app_name" {
  type        = string
  description = "Application name, used as a prefix for resources"
  default     = "elysia"
}

variable "billing_account" {
  type        = string
  description = "Billing account ID"
  sensitive   = true
}

variable "org_id" {
  type        = string
  description = "Organization ID"
  default     = ""
}

variable "folder_id" {
  type        = string
  description = "Folder ID where projects will be created"
  default     = ""
}

variable "region" {
  type        = string
  description = "Region"
  default     = "us-central1"
}

variable "environment" {
  type        = string
  description = "Environment (prod, staging, or preview)"
}

variable "branch_name" {
  type        = string
  description = "Git branch name (used for preview environments)"
  default     = ""
}
