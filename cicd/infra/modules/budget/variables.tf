variable "project_id" {
  type = string
}

variable "billing_account" {
  type      = string
  sensitive = true
}

variable "budget_amount" {
  type    = number
  default = 50
}

variable "budget_alert_emails" {
  type    = list(string)
  default = []
}
