---
name: nais-manifest
description: Create or update a Nais manifest from existing app and environment patterns
argument-hint: "app=<ekstern|intern> environment=<dev|staging|prod> change=<goal>"
agent: nais-agent
---

Create or update a Nais manifest using:

- App: `${input:app:ekstern or intern}`
- Environment: `${input:environment:dev, staging, or production}`
- Change: `${input:change:deployment behavior to add or modify}`

Inspect the app's `.nais/` directory and compare the closest environment-specific manifest before editing. Treat existing app names, namespaces, health paths, auth providers, ingress conventions, and template placeholders as authoritative. Consult the Nais documentation linked by the Nais agent for the current schema instead of copying a generic manifest.

Preserve environment differences and make only the requested change. Never add real secret values. Ask before changing production replicas/resources, authentication, GCP resources, or `accessPolicy`.

Format the changed YAML and report the manifest path plus the environment-specific decisions retained.
