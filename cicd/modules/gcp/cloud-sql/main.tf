resource "google_sql_database_instance" "main" {
  name             = "${var.app_name}-db-${var.environment}"
  project          = var.project_id
  region           = var.region
  database_version = "POSTGRES_16"

  settings {
    tier              = var.tier
    availability_type = "ZONAL"
    disk_size         = 10
    disk_type         = "PD_SSD"

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
    }
  }

  deletion_protection = true
}

resource "google_sql_database" "db" {
  name     = "servio_${var.environment}"
  project  = var.project_id
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "user" {
  name     = "postgres"
  project  = var.project_id
  instance = google_sql_database_instance.main.name
  password = var.db_password
}
