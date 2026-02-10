---
name: nais-manifest
description: Generate a production-ready Nais application manifest for Kubernetes deployment
---

You are creating a Nais application manifest for deploying to Nav's Kubernetes platform. This monorepo has two apps with existing Nais configs:

- **`apps/ekstern/.nais/`** — Citizen-facing app (ID-porten + TokenX auth)
- **`apps/intern/.nais/`** — Caseworker app (Azure AD / Entra ID auth)

## Existing Configuration Files

### Ekstern (citizen-facing)

| File                                | Purpose                      |
| ----------------------------------- | ---------------------------- |
| `deploy-prod.yml`                   | Production deployment        |
| `deploy-staging.yml`                | Staging deployment (dev-gcp) |
| `deploy-dev-branch.yaml`            | Feature branch deployment    |
| `deploy-sanity-staging.yml`         | Sanity CMS staging           |
| `deploy-veiledning-prod.yml`        | Veiledning production        |
| `deploy-veiledning-staging.yml`     | Veiledning staging           |
| `deploy-veiledning-dev-branch.yaml` | Veiledning feature branch    |
| `unleash-api-token-dev.yaml`        | Unleash token (dev)          |
| `unleash-api-token-prod.yaml`       | Unleash token (prod)         |

### Intern (caseworker)

| File                          | Purpose                      |
| ----------------------------- | ---------------------------- |
| `deploy-prod.yml`             | Production deployment        |
| `deploy-staging.yml`          | Staging deployment (dev-gcp) |
| `deploy-dev.yml`              | Development deployment       |
| `unleash-api-token-dev.yaml`  | Unleash token (dev)          |
| `unleash-api-token-prod.yaml` | Unleash token (prod)         |

## Common Configuration (both apps share)

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  annotations:
    nais.io/run-as-user: '101' # nginx
spec:
  image: '{{ image }}'
  port: 8080
  replicas:
    min: 2
    max: 4 # prod: 4, staging: 2
  liveness:
    path: /internal/health/liveness
    initialDelay: 20
    periodSeconds: 20
    failureThreshold: 5
    timeout: 1
  readiness:
    path: /internal/health/readiness
    initialDelay: 20
    periodSeconds: 20
    failureThreshold: 5
    timeout: 1
  frontend:
    generatedConfig:
      mountPath: /app/src/nais.js
  prometheus:
    enabled: true
    path: /metrics
  accessPolicy:
    outbound:
      rules:
        - application: pensjonskalkulator-backend
      external:
        - host: pensjonskalkulator-unleash-api.nav.cloud.nais.io
  envFrom:
    - secret: pensjonskalkulator-frontend-{variant}-unleash-api-token
```

**Note:** Health check paths are `/internal/health/liveness` and `/internal/health/readiness` — NOT `/isalive` and `/isready`.

## Ekstern-Specific Config

```yaml
metadata:
  name: pensjonskalkulator-frontend-ekstern
  namespace: pensjonskalkulator
  labels:
    team: pensjonskalkulator
spec:
  ingresses:
    - https://www.nav.no/pensjon/kalkulator # prod
    - https://staging.ekstern.dev.nav.no/pensjon/kalkulator # staging
  observability:
    autoInstrumentation:
      enabled: true
      runtime: nodejs
  gcp:
    buckets:
      - name: pkf
        retentionPeriodDays: 30
        lifecycleCondition:
          age: 7
          createdBefore: 2020-01-01
          numNewerVersions: 2
          withState: ANY
  tokenx:
    enabled: true
  idporten:
    enabled: true
    sidecar:
      level: idporten-loa-substantial
      enabled: true
      autoLogin: true
      autoLoginIgnorePaths:
        - /internal/ping
        - /pensjon/kalkulator
        - /pensjon/kalkulator/login
        - /pensjon/kalkulator/assets/*
        - /pensjon/kalkulator/api/status
        - /pensjon/kalkulator/api/feature/*
        - /pensjon/kalkulator/personopplysninger
        - /pensjon/kalkulator/forbehold
        - /pensjon/kalkulator/src/*
        - /pensjon/kalkulator/v3/api-docs/current
  accessPolicy:
    outbound:
      external:
        - host: www.nav.no # prod only
        - host: pensjonskalkulator-unleash-api.nav.cloud.nais.io
    inbound:
      rules:
        - application: wonderwalled-idporten # staging only
          namespace: aura
  env:
    - name: PENSJONSKALKULATOR_BACKEND
      value: http://pensjonskalkulator-backend
    - name: TOKEN_X_OBO_AUDIENCE
      value: '{env}-gcp:pensjonskalkulator:pensjonskalkulator-backend' # prod-gcp or dev-gcp
    - name: DETALJERT_KALKULATOR_URL
      value: 'https://www.nav.no/pselv/simulering.jsf?simpleMode=true' # prod URL
```

## Intern-Specific Config

```yaml
metadata:
  name: pensjonskalkulator-frontend-intern
  namespace: pensjonskalkulator-frontend # Note: different namespace than ekstern
  labels:
    team: pensjonskalkulator
spec:
  ingresses:
    - https://pensjonskalkulator-frontend-intern.ansatt.nav.no/pensjon/kalkulator # prod
    - https://staging-pensjonskalkulator-frontend-intern.ansatt.dev.nav.no # staging
  azure:
    application:
      enabled: true
      claims:
        groups:
          - id: '...' # 0000-GA-PENSJON_SAKSBEHANDLER (different IDs per env)
          - id: '...' # 0000-GA-Pensjon_VEILEDER
          - id: '...' # 0000-GA-Egne_ansatte
          - id: '...' # 0000-GA-Fortrolig_Adresse
          - id: '...' # 0000-GA-Strengt_Fortrolig_Adresse
        extra:
          - NAVident
    sidecar:
      enabled: true
      autoLogin: true
      autoLoginIgnorePaths:
        - /internal/ping
        - /pensjon/kalkulator
        - /pensjon/kalkulator/login
        - /pensjon/kalkulator/personopplysninger
        - /pensjon/kalkulator/forbehold
        - /pensjon/kalkulator/assets/*
        - /pensjon/kalkulator/api/status
        - /pensjon/kalkulator/api/feature/*
        - /pensjon/kalkulator/src/*
  env:
    - name: PENSJONSKALKULATOR_BACKEND
      value: http://pensjonskalkulator-backend
    - name: ENTRA_ID_OBO_SCOPE
      value: 'api://{env}-gcp.pensjonskalkulator.pensjonskalkulator-backend/.default'
    - name: DETALJERT_KALKULATOR_URL
      value: 'https://www.nav.no/pselv/simulering.jsf?simpleMode=true&context=pensjon'
```

Key differences from ekstern:

- Uses **Azure AD (Entra ID)** instead of ID-porten + TokenX
- Uses `ENTRA_ID_OBO_SCOPE` instead of `TOKEN_X_OBO_AUDIENCE`
- Different namespace (`pensjonskalkulator-frontend` vs `pensjonskalkulator`)
- Requires AD group claims for authorization
- Uses `.ansatt.nav.no` domain instead of `www.nav.no`
- No GCP buckets or observability auto-instrumentation

## Key Differences: Staging vs Production

| Aspect             | Staging                        | Production            |
| ------------------ | ------------------------------ | --------------------- |
| Replicas           | min: 2, max: 2                 | min: 2, max: 4        |
| Ingress domain     | `*.dev.nav.no`                 | `*.nav.no`            |
| OBO audience/scope | `dev-gcp:...`                  | `prod-gcp:...`        |
| Ekstern outbound   | No `www.nav.no`                | Includes `www.nav.no` |
| Ekstern inbound    | `wonderwalled-idporten` (aura) | None                  |
| Azure group IDs    | Dev group IDs                  | Prod group IDs        |

## Follow-up

After generating the manifest, remind the user to:

1. Ensure health endpoints exist at `/internal/health/liveness` and `/internal/health/readiness`
2. Ensure the application listens on port 8080
3. If adding a new Unleash toggle, create the corresponding secret YAML
4. For different environments, adjust ingress URLs, OBO audiences, and Azure group IDs
