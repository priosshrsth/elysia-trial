output "db_internal_ip" {
  value = google_compute_address.db_internal.address
}

output "instance_name" {
  value = google_compute_instance.db.name
}
