locals {
  env_secrets = flatten([
    for env in var.environments : [
      for secret in var.secret_names : {
        key  = "${env}-${secret}"
        env  = env
        name = secret
      }
    ]
  ])
}

resource "google_secret_manager_secret" "secrets" {
  for_each  = { for s in local.env_secrets : s.key => s }
  project   = var.project_id
  secret_id = "${var.app_name}-${each.key}"

  replication {
    auto {}
  }

  labels = {
    environment = each.value.env
    app         = var.app_name
  }
}
