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

variable "tier" {
  type    = string
  default = "db-f1-micro"
}

variable "network_id" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}
