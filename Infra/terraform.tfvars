project_id = "startintech"
region     = "southamerica-east1"

# ─── Sensitive values ────────────────────────────────────────────────────────
# Pass these via CLI flags, environment variables, or CI/CD secrets.
# NEVER commit real values to source control.
#
# Tip: You can export your .env variables before running terraform:
#   export TF_VAR_openrouter_api_key=$(grep '^OPENROUTER_API_KEY=' ../.env | cut -d '=' -f2- | tr -d '"')
#   export TF_VAR_oauth_client_id=$(grep '^GOOGLE_OAUTH_CLIENT_ID=' ../.env | cut -d '=' -f2- | tr -d '"')
#   export TF_VAR_oauth_client_secret=$(grep '^GOOGLE_OAUTH_CLIENT_SECRET=' ../.env | cut -d '=' -f2- | tr -d '"')
#   export TF_VAR_adzuna_app_id=$(grep '^ADZUNA_APPLICATION_ID=' ../.env | cut -d '=' -f2- | tr -d '"')
#   export TF_VAR_adzuna_app_key=$(grep '^ADZUNA_APPLICATION_KEY=' ../.env | cut -d '=' -f2- | tr -d '"')
#
# Domain & CORS:
#   spa_origins default to ["https://startintech.site", "https://www.startintech.site", "http://localhost:5000", "http://localhost:5173"]