# ─── Frontend SPA Hosting (Firebase Hosting) ─────────────────────────────────
# The React + Vite frontend is hosted on Google's Firebase Hosting CDN, which runs
# natively on top of this Google Cloud project.
#
# Why Firebase Hosting instead of a plain Cloud Storage bucket?
# 1. Plain GCS buckets do NOT support SSL/TLS (HTTPS) on custom domains via CNAME.
# 2. Firebase Hosting provides automatic Google-managed SSL for startintech.site,
#    global SSD-backed Edge CDN caching, and native SPA client-side routing (rewrites).
# 3. Running Firebase Hosting directly eliminates the need for an expensive GCP
#    External HTTP(S) Load Balancer (~$18-25/month).
#
# Deployment is performed from the Frontend/ directory:
#   bun run build:frontend && firebase deploy --only hosting
#
# Custom Domain:
#   Map `startintech.site` and `www.startintech.site` in Firebase Console > Hosting.
