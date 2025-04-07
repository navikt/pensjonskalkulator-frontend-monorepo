# pensjonskalkulator-frontend

[
![Build and deploy](https://github.com/navikt/pensjonskalkulator-frontend/actions/workflows/deploy-dev.yaml/badge.svg)
](https://github.com/navikt/pensjonskalkulator-frontend/actions/workflows/deploy-dev.yaml)

Frontend-applikasjon for pensjonskalkulator for brukere født 1963 eller senere.

Dette er brukere som berøres av ny AFP-ordning i offentlig sektor, og som omfattes av kapittel 20 i
pensjonsregelverket (ikke kapittel 19).

## Teknologi

Prosjektet kjører med Node > v22 og Npm > v10.1.0

## Komme i gang

```console
// Bygger applikasjonen og starter vite devserver på port :5173
npm run start
```

```console
// Sørger for riktig formatering med eslint, prettier og stylelint
npm run prebuild
```

```console
// Bygger applikasjonen og outputer de kompilerte filene under /dist
npm run build
```

```console
// Serveren de statiske filene som er bygd under /dist
// Forutsetter at man har kjørt npm run build før
npm run preview
```

```console
// Kjører enhetstester og genererer coverage
npm run test
```

```console
// Kjører integrasjonstester.
// Tester opp mot den bundlede applikasjonen i /dist, så husk å bygge appen før kjøring.
npm run cy:test

// Kjører tester i nettleseren mot port :4173 - krever at man kjører f.eks npm run preview
npm run cy:open
```

## environment variables

VITE_DECORATOR_URL: url'en hvor dekoratøren hostes statisk. brukes i index.html

## oversikt over portene

- localhost:5173 brukes av vite ved npm run start
- localhost:4173 brukes av vite ved npm run preview (static serve)

## Kjøre lokalt mot Q2
1. Hent ut ACCESS_TOKEN fra <https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp:pensjonskalkulator:pensjonskalkulator-backend>
1. Sett ACCESS_TOKEN som miljøvariabel
1. Sett PENSJONSKALKULATOR_BACKEND miljøvariabel til: <https://pensjonskalkulator-backend.intern.dev.nav.no>
1. `set -a` for å kunne source .env-filen i terminal
1. `source .env.development-q2`
1. Kjør `npm run start:q2`

Dekoratøren vil ikke matche opp med innlogget bruker, siden ACCESS_TOKEN hentes fra environment. For å bytte bruker må man logge ut med https://logout.ekstern.nav.no/oauth2/logout

## Systemdokumentasjon og beslutninger

- [Frontend](https://confluence.adeo.no/display/PEN/Pensjonskalkulator+frontend)
- [Overordnet](#TODO)

## Henvendelser

NAV-interne henvendelser kan sendes via Slack i
kanalen [#pensjonskalkulator](https://nav-it.slack.com/archives/C04M46SPSRL).
