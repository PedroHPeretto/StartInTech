resource "google_project_service" "gcp_services" {
  for_each = toset([
    "run.googleapis.com",              # Cloud Run
    "sqladmin.googleapis.com",         # Cloud SQL
    "secretmanager.googleapis.com",    # Secret Manager
    "storage.googleapis.com",          # Cloud Storage
    "iam.googleapis.com",              # IAM (Service Accounts & permissions)
    "iamcredentials.googleapis.com",   # Signed URL generation via SA
    "artifactregistry.googleapis.com", # Docker image registry for Cloud Run
    "firebase.googleapis.com",         # Firebase Management API
    "firebasehosting.googleapis.com"   # Firebase Hosting API for SPA CDN
  ])
  service            = each.key
  disable_on_destroy = false
}