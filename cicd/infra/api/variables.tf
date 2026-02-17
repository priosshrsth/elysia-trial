variable "project_id" {
  type = string
}

variable "environments" {
  type    = list(string)
  default = ["prod", "staging"]
}
variable "tf_state_bucket" {
  type = string
}
