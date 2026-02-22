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

# Serverless VPC Access connector — Cloud Run -> private VPC connectivity
resource "google_vpc_access_connector" "connector" {
  name          = "${var.app_name}-vpc-cx"
  project       = var.project_id
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc.id
  machine_type  = "e2-micro"
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

# Private Services Access — required for Cloud SQL private IP
resource "google_compute_global_address" "private_ip" {
  name          = "${var.app_name}-private-ip"
  project       = var.project_id
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip.name]
}
