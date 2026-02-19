output "network_id" {
  value = google_compute_network.vpc.id
}

output "subnet_id" {
  value = google_compute_subnetwork.main.id
}

output "vpc_connector_id" {
  value = google_vpc_access_connector.connector.id
}

output "private_vpc_connection" {
  value = var.enable_private_services_access ? google_service_networking_connection.private_vpc[0].id : null
}
