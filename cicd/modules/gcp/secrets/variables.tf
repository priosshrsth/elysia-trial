variable "project_id" {
  type = string
}

variable "app_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "secret_names" {
  type        = list(string)
  description = "List of secret names to create per environment"
}
