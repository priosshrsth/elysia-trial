resource "google_compute_network" "vpc" {
  name                    = "${var.app_name}-vpc"
  project                 = var.project_id
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "main" {
  name          = "${var.app_name}-subnet"
  project       = var.project_id
  region        = var.region
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.0.0.0/24"
}

# Serverless VPC Access connector — Cloud Run -> VM connectivity
resource "google_vpc_access_connector" "connector" {
  name          = "${var.app_name}-vpc-cx"
  project       = var.project_id
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc.id
  machine_type  = "f1-micro"
  min_instances = 2
  max_instances = 3
}

# Cloud NAT for outbound internet
resource "google_compute_router" "router" {
  name    = "${var.app_name}-router"
  project = var.project_id
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "${var.app_name}-nat"
  project                            = var.project_id
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# Allow VPC connector and subnet to reach DB ports
resource "google_compute_firewall" "allow_internal" {
  name    = "${var.app_name}-allow-internal"
  project = var.project_id
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["5432", "6379"]
  }

  source_ranges = ["10.8.0.0/28", "10.0.0.0/24"]
  target_tags   = ["db-server"]
}

# Allow SSH via IAP only
resource "google_compute_firewall" "allow_ssh_iap" {
  name    = "${var.app_name}-allow-ssh-iap"
  project = var.project_id
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["db-server"]
}
