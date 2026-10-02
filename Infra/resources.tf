# ─── Cloud SQL ───────────────────────────────────────────────────────────────

# Secure random password for the database user (Terraform-managed)
resource "random_password" "db_password" {
  length  = 32
  special = false # Avoids shell quoting issues in connection strings
}

resource "google_sql_database_instance" "postgres" {
  name             = "startintech-db-instance"
  database_version = "POSTGRES_17"
  region           = var.region

  settings {
    # db-f1-micro for dev/staging; upgrade to db-custom-2-7680 for production
    tier = "db-f1-micro"

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "03:00" # 03:00 UTC (midnight BRT)
      transaction_log_retention_days = 7

      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      # Public IP is required for Cloud Run Proxy to work without VPC
      ipv4_enabled = true
    }
  }

  # Prevent accidental destruction of the database.
  deletion_protection = false

  depends_on = [google_project_service.gcp_services]
}

resource "google_sql_database" "database" {
  name     = "startintech_db"
  instance = google_sql_database_instance.postgres.name
}

# Database user — credentials are stored in Secret Manager below
resource "google_sql_user" "db_user" {
  name     = "startintech_user"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

# ─── Cloud Storage: Private (PDF uploads via Signed URL) ─────────────────────

resource "google_storage_bucket" "private_storage" {
  name                        = "${var.project_id}-private-storage"
  location                    = var.region
  force_destroy               = false # Prevent accidental deletion of user data
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  # CORS: allows the React SPA to PUT files directly from the browser via Signed URL.
  cors {
    origin          = var.spa_origins
    method          = ["GET", "PUT", "POST", "OPTIONS"]
    response_header = ["Content-Type", "x-goog-resumable", "x-goog-content-length-range"]
    max_age_seconds = 3600
  }

  # LGPD compliance: automatically delete raw resume files after 90 days.
  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 90
    }
  }
}

# ─── Secret Manager ──────────────────────────────────────────────────────────

# Database URL (auto-constructed from Cloud SQL resources — no manual input needed)
resource "google_secret_manager_secret" "database_url" {
  secret_id = "db_secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.gcp_services]
}

resource "google_secret_manager_secret_version" "database_url_version" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.db_user.name}:${random_password.db_password.result}@/${google_sql_database.database.name}?host=/cloudsql/${google_sql_database_instance.postgres.connection_name}"
}

# OpenRouter API Key (for LLM resume analysis)
resource "google_secret_manager_secret" "openrouter_api_key" {
  secret_id = "openrouter_api_key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.gcp_services]
}

resource "google_secret_manager_secret_version" "openrouter_api_key_version" {
  secret      = google_secret_manager_secret.openrouter_api_key.id
  secret_data = var.openrouter_api_key
}

# Google OAuth 2.0 Client ID
resource "google_secret_manager_secret" "oauth_client_id" {
  secret_id = "oauth_client_id"
  replication {
    auto {}
  }
  depends_on = [google_project_service.gcp_services]
}

resource "google_secret_manager_secret_version" "oauth_client_id_version" {
  secret      = google_secret_manager_secret.oauth_client_id.id
  secret_data = var.oauth_client_id
}

# Google OAuth 2.0 Client Secret
resource "google_secret_manager_secret" "oauth_client_secret" {
  secret_id = "oauth_client_secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.gcp_services]
}

resource "google_secret_manager_secret_version" "oauth_client_secret_version" {
  secret      = google_secret_manager_secret.oauth_client_secret.id
  secret_data = var.oauth_client_secret
}

# Adzuna Jobs API — App ID
resource "google_secret_manager_secret" "adzuna_app_id" {
  secret_id = "adzuna_app_id"
  replication {
    auto {}
  }
  depends_on = [google_project_service.gcp_services]
}

resource "google_secret_manager_secret_version" "adzuna_app_id_version" {
  secret      = google_secret_manager_secret.adzuna_app_id.id
  secret_data = var.adzuna_app_id
}

# Adzuna Jobs API — App Key
resource "google_secret_manager_secret" "adzuna_app_key" {
  secret_id = "adzuna_app_key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.gcp_services]
}

resource "google_secret_manager_secret_version" "adzuna_app_key_version" {
  secret      = google_secret_manager_secret.adzuna_app_key.id
  secret_data = var.adzuna_app_key
}