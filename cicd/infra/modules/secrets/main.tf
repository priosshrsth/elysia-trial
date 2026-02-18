resource "google_secret_manager_secret" "secrets" {
  for_each  = toset(var.secret_names)
  project   = var.project_id
  secret_id = each.key

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    app         = var.app_name
  }
}
