# pensjonskalkulator-frontend

[![Build and deploy](https://github.com/navikt/pensjonskalkulator-frontend/actions/workflows/deploy.yaml/badge.svg)](https://github.com/navikt/pensjonskalkulator-frontend/actions/workflows/deploy.yaml)

Frontend-applikasjon for pensjonskalkulator for brukere født 1963 eller senere.

Dette er brukere som berøres av ny AFP-ordning i offentlig sektor, og som omfattes av kapittel 20 i
pensjonsregelverket (ikke kapittel 19).

## Teknologi

Prosjektet kjører med Node > v22.16.0 og pnpm > v9.0.0

## Komme i gang

```console
// Bygger applikasjonen og starter vite devserver på port :5173
pnpm start
```

```console
// Sørger for riktig formatering med eslint, prettier og stylelint
pnpm prebuild
```

```console
// Bygger applikasjonen og outputer de kompilerte filene under /dist
pnpm build
```

```console
// Serveren de statiske filene som er bygd under /dist
// Forutsetter at man har kjørt pnpm build før
pnpm preview
```

```console
// Kjører enhetstester og genererer coverage
pnpm test
```

```console
// Kjører integrasjonstester.
// Tester opp mot den bundlede applikasjonen i /dist, så husk å bygge appen før kjøring.
pnpm cy:test

// Kjører tester i nettleseren mot port :4173 - krever at man kjører f.eks pnpm preview
pnpm cy:open
```

### i18n-ally

Vi bruker react-intl for tekster (men noe ligger også i Sanity). Hvis du bruker vscode kan du installere en extension som heter [i18n-ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally), som gjør at tekstene vises inline i editoren. Anbefalte settings:

```json
"i18n-ally.localesPaths": ["src/translations"],
"i18n-ally.enabledParsers": ["ts"],
"i18n-ally.parsers.typescript.compilerOptions": {
  "moduleResolution": "node"
},
"i18n-ally.displayLanguage": "nb",
"i18n-ally.annotationInPlace": false,
"i18n-ally.keystyle": "flat"
```

## environment variables

VITE_DECORATOR_URL: url'en hvor dekoratøren hostes statisk. brukes i index.html

## oversikt over portene

- localhost:5173 brukes av vite ved pnpm start
- localhost:4173 brukes av vite ved pnpm preview (static serve)

## Kjøre lokalt mot Q2

1. Hent ut ACCESS_TOKEN fra <https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp:pensjonskalkulator:pensjonskalkulator-backend>
1. Sett ACCESS_TOKEN som miljøvariabel
1. Sett PENSJONSKALKULATOR_BACKEND miljøvariabel til: <https://pensjonskalkulator-backend.intern.dev.nav.no>
1. `set -a` for å kunne source .env-filen i terminal
1. `source .env.development-q2`
1. Kjør `npm run start:q2`

Dekoratøren vil ikke matche opp med innlogget bruker, siden ACCESS_TOKEN hentes fra environment. For å bytte bruker må man logge ut med <https://logout.ekstern.nav.no/oauth2/logout>

## Gjenopprettelse av Sanity dataset

OBS. Ikke gjenopprett med mindre det er helt nødvendig. Backup er kun snapshot fra production, og gjenoppretting vil slette alle historiske endringer i datasetet.

1. Sørg for at Sanity CLI er installert. Bruk Confluence for veiledning: https://confluence.adeo.no/spaces/PEN/pages/657873346/Pensjonskalkulator+CMS+-+Sanity
1. Last ned siste backup fra Google Cloud Storage: gs://pkf/sanity-backups/
1. Lag en mappe med følgende struktur, og kopier backup-filen til data.ndjson:
   ```
   # backup-mappe/
          # ├── data.ndjson
          # ├── files
          # └── images
   ```
1. Pakk mappen som en .tar.gz-fil.
1. Gjenopprett dataset via Sanity CLI (OBS: Dette kan ikke reverseres):
   ```bash
   sanity dataset import backup-mappe.tar.gz production --replace
   ```

## Systemdokumentasjon og beslutninger

- [Frontend](https://confluence.adeo.no/display/PEN/Pensjonskalkulator+frontend)

## Henvendelser

NAV-interne henvendelser kan sendes via Slack i
kanalen [#pensjonskalkulator](https://nav-it.slack.com/archives/C04M46SPSRL).
