variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "app_name" {
  type = string
}

variable "enable_private_services_access" {
  type    = bool
  default = false
}
