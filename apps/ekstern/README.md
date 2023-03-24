# pensjonskalkulator-frontend

[
![Build and deploy](https://github.com/navikt/pensjonskalkulator-frontend/actions/workflows/deploy-dev.yaml/badge.svg)
](https://github.com/navikt/pensjonskalkulator-frontend/actions/workflows/deploy-dev.yaml)

Frontend-applikasjon for pensjonskalkulator for brukere født 1963 eller senere.

Dette er brukere som berøres av ny AFP-ordning i offentlig sektor, og som omfattes av kapittel 20 i
pensjonsregelverket (ikke kapittel 19).

## Teknologi

Prosjektet kjører med Node > v19.6.0 og Npm > v9.4.0

- NGINX
- Vite
- React
- Typescript

## Komme i gang

```
// Bygger applikasjonen og starter vite devserver på port :5173
// Starter msw på port :8088
npm run start
```

```
// Bygger applikasjonen og outputer de kompilerte filene under /dist
// Kjører også eslint, prettier og stylelint som prebuild steg
npm run build
```

```
// Serveren de statiske filene som er bygd under /dist
// Forutsetter at man har kjørt npm run build før
npm run preview
```

```
// Kjører enhetstester og genererer coverage
// Kjører msw på port :8088
npm run test
```

```
// Kjører integrasjonstester.
// Tester opp mot den bundlede applikasjonen i /dist, så husk å bygge appen før kjøring.
npm run cy:test

// Kjører tester i nettleseren
npm run cy:open
```

## Henvendelser

NAV-interne henvendelser kan sendes via Slack i
kanalen [#pensjonskalkulator](https://nav-it.slack.com/archives/C04M46SPSRL).
