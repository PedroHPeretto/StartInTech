# ─── Outputs ─────────────────────────────────────────────────────────────────
# Expose key resource identifiers to be consumed by CI/CD pipelines,
# the Backend application config, and other Terraform modules.

output "cloud_run_url" {
  description = "Public HTTPS URL of the NestJS Cloud Run service"
  value       = google_cloud_run_v2_service.startintech_api.uri
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL instance connection name (used by Cloud Run unix socket proxy)"
  value       = google_sql_database_instance.postgres.connection_name
}

output "cloud_sql_db_name" {
  description = "PostgreSQL database name"
  value       = google_sql_database.database.name
}

output "cloud_sql_db_user" {
  description = "PostgreSQL username"
  value       = google_sql_user.db_user.name
}

output "private_storage_bucket" {
  description = "GCS bucket name for private PDF uploads (referenced by GCS_PRIVATE_BUCKET env var)"
  value       = google_storage_bucket.private_storage.name
}

output "cloud_run_sa_email" {
  description = "Service Account email used by the Cloud Run service"
  value       = google_service_account.cloud_run_sa.email
}

output "frontend_url" {
  description = "Production URL of the Frontend SPA on Firebase Hosting"
  value       = "https://startintech.site"
}
