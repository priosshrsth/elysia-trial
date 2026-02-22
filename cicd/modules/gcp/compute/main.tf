# Static internal IP for reliable Cloud Run -> VM connectivity
resource "google_compute_address" "db_internal" {
  name         = "${var.app_name}-db-internal"
  project      = var.project_id
  region       = var.region
  address_type = "INTERNAL"
  subnetwork   = var.subnet_id
}

resource "google_compute_instance" "db" {
  name         = "${var.app_name}-db"
  project      = var.project_id
  zone         = var.zone
  machine_type = var.machine_type
  tags         = ["db-server"]

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
  }

  boot_disk {
    initialize_params {
      image = "projects/cos-cloud/global/images/family/cos-stable"
      size  = 30
      type  = "pd-ssd"
    }
  }

  network_interface {
    subnetwork = var.subnet_id
    network_ip = google_compute_address.db_internal.address
    # No external IP — use IAP for SSH
  }

  metadata = {
    db-password  = var.db_password
    environment = var.environment
  }

  metadata_startup_script = file("${path.module}/startup.sh")

  service_account {
    scopes = ["cloud-platform"]
  }
}
