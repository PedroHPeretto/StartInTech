variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  description = "GCP region for all resources"
}

variable "openrouter_api_key" {
  type        = string
  sensitive   = true
  description = "OpenRouter API Key for AI resume analysis"
}

variable "oauth_client_id" {
  type        = string
  sensitive   = true
  description = "Google OAuth 2.0 Client ID"
  default     = "placeholder-oauth-client-id"
}

variable "oauth_client_secret" {
  type        = string
  sensitive   = true
  description = "Google OAuth 2.0 Client Secret"
  default     = "placeholder-oauth-client-secret"
}

variable "adzuna_app_id" {
  type        = string
  sensitive   = true
  description = "Adzuna Jobs API Application ID"
  default     = "placeholder-adzuna-app-id"
}

variable "adzuna_app_key" {
  type        = string
  sensitive   = true
  description = "Adzuna Jobs API Application Key"
  default     = "placeholder-adzuna-app-key"
}

variable "spa_origins" {
  type        = list(string)
  description = "Frontend SPA origins for CORS policy"
  default = [
    "https://startintech.site",
    "https://www.startintech.site",
    "http://localhost:5000",
    "http://localhost:5173"
  ]
}