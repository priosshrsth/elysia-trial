output "service_urls" {
  value = { for k, v in module.cloud_run : k => v.service_url }
}

output "service_names" {
  value = { for k, v in module.cloud_run : k => v.service_name }
}
