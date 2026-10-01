# ─── Service Account ─────────────────────────────────────────────────────────

resource "google_service_account" "cloud_run_sa" {
  account_id   = "startintech-api-sa"
  display_name = "StartInTech API Service Account"
}

# ─── IAM: Secret Manager access ──────────────────────────────────────────────

resource "google_secret_manager_secret_iam_member" "secret_access_db" {
  secret_id = google_secret_manager_secret.database_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "secret_access_openrouter" {
  secret_id = google_secret_manager_secret.openrouter_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "secret_access_oauth_client_id" {
  secret_id = google_secret_manager_secret.oauth_client_id.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "secret_access_oauth_client_secret" {
  secret_id = google_secret_manager_secret.oauth_client_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "secret_access_adzuna_app_id" {
  secret_id = google_secret_manager_secret.adzuna_app_id.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "secret_access_adzuna_app_key" {
  secret_id = google_secret_manager_secret.adzuna_app_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ─── IAM: Cloud Storage access ───────────────────────────────────────────────

resource "google_storage_bucket_iam_member" "storage_access" {
  bucket = google_storage_bucket.private_storage.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ─── IAM: Cloud SQL access ───────────────────────────────────────────────────

resource "google_project_iam_member" "cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ─── IAM: Signed URL generation ──────────────────────────────────────────────

resource "google_service_account_iam_member" "sa_token_creator" {
  service_account_id = google_service_account.cloud_run_sa.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ─── Cloud Run Service ────────────────────────────────────────────────────────

resource "google_cloud_run_v2_service" "startintech_api" {
  name     = "startintech-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run_sa.email

    # Cloud SQL unix socket volume
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.postgres.connection_name]
      }
    }

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "OPENROUTER_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.openrouter_api_key.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "OAUTH_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.oauth_client_id.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "OAUTH_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.oauth_client_secret.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "ADZUNA_APP_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.adzuna_app_id.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "ADZUNA_APP_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.adzuna_app_key.secret_id
            version = "latest"
          }
        }
      }

      env {
        name  = "GCS_PRIVATE_BUCKET"
        value = google_storage_bucket.private_storage.name
      }

      env {
        name  = "CLOUD_SQL_CONNECTION_NAME"
        value = google_sql_database_instance.postgres.connection_name
      }
    }
  }

  depends_on = [
    google_project_service.gcp_services,
    google_project_iam_member.cloudsql_client,
    google_service_account_iam_member.sa_token_creator,
    google_secret_manager_secret_iam_member.secret_access_db,
    google_secret_manager_secret_iam_member.secret_access_openrouter,
    google_secret_manager_secret_iam_member.secret_access_oauth_client_id,
    google_secret_manager_secret_iam_member.secret_access_oauth_client_secret,
    google_secret_manager_secret_iam_member.secret_access_adzuna_app_id,
    google_secret_manager_secret_iam_member.secret_access_adzuna_app_key,
    google_secret_manager_secret_version.database_url_version,
    google_secret_manager_secret_version.openrouter_api_key_version,
    google_storage_bucket_iam_member.storage_access,
  ]
}

# ─── Public invoker ──────────────────────────────────────────────────────────

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  name     = google_cloud_run_v2_service.startintech_api.name
  location = google_cloud_run_v2_service.startintech_api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}