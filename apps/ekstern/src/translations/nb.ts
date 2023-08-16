const translations = {
  'application.title': 'Pensjonskalkulator',
  'application.title.stegvisning.step1': 'Start – Pensjonskalkulator',
  'application.title.stegvisning.step2': 'Samtykke – Pensjonskalkulator',
  'application.title.stegvisning.step3':
    'Offentlig tjenestepensjon – Pensjonskalkulator',
  'application.title.stegvisning.step4': 'AFP – Pensjonskalkulator',
  'application.title.stegvisning.step5': 'Sivilstand – Pensjonskalkulator',
  'application.title.beregning': 'Beregning – Pensjonskalkulator',
  'application.title.forbehold': 'Forbehold – Pensjonskalkulator',
  'loading.person': 'Henter personopplysninger',
  'error.global.title': 'Oops! Det har oppstått en uventet feil',
  'error.global.ingress':
    'Vi jobber med å rette feilen. Hvis problemet vedvarer, kan du kontakte oss på 55 55 33 34.',
  'errorpage.global.button.primary': 'Last siden på nytt',
  'errorpage.global.button.secondary': 'Tilbake til Din Pensjon',
  'errorpage.404.title': 'Oops! Siden du leter etter finnes ikke.',
  'errorpage.404.list_item1':
    'Hvis du skrev inn adressen direkte i nettleseren kan du sjekke om den er stavet riktig.',
  'errorpage.404.list_item2':
    'Hvis du klikket på en lenke er den feil eller utdatert.',
  'errorpage.404.button.primary': 'Tilbake til forrige side',
  'errorpage.404.button.secondary': 'Tilbake til Din Pensjon',
  'stegvisning.neste': 'Neste',
  'stegvisning.tilbake': 'Tilbake',
  'stegvisning.avbryt': 'Avbryt',
  'stegvisning.beregn': 'Beregn pensjon',
  'stegvisning.start.title': 'Hei',
  'stegvisning.start.ingress':
    'For å kunne beregne din pensjon trenger vi at du svarer på noen spørsmål. Du må svare på alle spørsmålene for å kunne gå videre.',
  'stegvisning.start.start': 'Kom i gang',
  'stegvisning.samtykke.title': 'Pensjonen din',
  'stegvisning.samtykke.ingress':
    'Kalkulatoren viser alderspensjonen din fra folketrygden (NAV) og eventuelt avtalefestet pensjon (AFP). For å vise tjenestepensjon fra arbeidsgivere må vi ha ditt samtykke til å hente pensjonsavtalene dine.',
  'stegvisning.samtykke.readmore_title': 'Disse opplysningene henter vi',
  'stegvisning.samtykke.readmore_ingress':
    'Dersom du ønsker at NAV henter inn opplysninger om hva du vil få i pensjon fra private pensjonsordninger, og om du kan ha rettigheter i offentlige pensjonsordninger må du samtykke til det. Det vil gi deg en bedre oversikt over dine totale pensjonsrettigheter. Det er ett frivillig samtykke, og du kan velge nei for å kun beregne alderspensjon (NAV).',
  'stegvisning.samtykke.readmore_list_title': 'Samtykket:',
  'stegvisning.samtykke.readmore_list_item1':
    'innebærer at vi henter opplysninger om pensjonsavtaler i privat sektor fra Norsk Pensjon.',
  'stegvisning.samtykke.readmore_list_item2':
    'innebærer at vi sjekker om du er eller har vært medlem i en offentlig tjenestepensjonsordning. Grunnet nye regler for tjenestepensjon og AFP i offentlig sektor ikke er endelig avklart kan vi ikke hente beregninger fra tjenestepensjonsordninger, men du vil få informasjon om at du kan ha rett til tjenestepensjon. ',
  'stegvisning.samtykke.readmore_list_item3':
    'gjelder kun for denne ene beregningen, og resultatet lagres ikke hos oss. Resultatet er ikke juridisk bindende for noen part.',
  'stegvisning.samtykke.radio_label': 'Skal vi hente dine pensjonsavtaler?',
  'stegvisning.samtykke.radio_ja': 'Ja',
  'stegvisning.samtykke.radio_nei': 'Nei, fortsett uten',
  'stegvisning.samtykke.validation_error':
    'Du må svare på om du vil at vi skal hente dine pensjonsavtaler.',
  'stegvisning.offentligtp.title':
    'Du kan ha rett til offentlig tjenestepensjon',
  'stegvisning.offentligtp.loading':
    'Henter informasjon om medlemskap til offentlig tjenestepensjon',
  'stegvisning.offentligtp.ingress_1':
    'Du er eller har vært medlem i en offentlig tjenestepensjonsordning og kan ha rett til tjenestepensjon. Men vi kan dessverre ikke hente inn dine avtaler. Sjekk hva som gjelder deg hos din tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonskasse m.fl.)',
  'stegvisning.offentligtp.ingress_2':
    'Du kan likevel gå videre for å beregne alderspensjon fra NAV og pensjonsavtaler i privat sektor.',
  'stegvisning.afp.title': 'Du kan ha rett til AFP',
  'stegvisning.afp.ingress':
    'For å få avtalefestet pensjon (AFP) må arbeidsgiveren din ha en slik avtale og du må kvalifisere til å få den.',
  'stegvisning.afp.readmore_privat_title':
    'Om avtalefestet pensjon i privat sektor',
  'stegvisning.afp.readmore_list_title': 'AFP:',
  'stegvisning.afp.readmore_privat_list_item1': 'er en livsvarig pensjon',
  'stegvisning.afp.readmore_privat_list_item2': 'kan taes ut sammen med arbeid',
  'stegvisning.afp.readmore_privat_list_item3':
    'må taes ut sammen med alderspensjon fra folketrygden (NAV) og tjenestepensjon',
  'stegvisning.afp.readmore_privat_link':
    'Les om vilkårene til <link>AFP i privat sektor på afp.no</link>',
  'stegvisning.afp.readmore_privat_url': 'https://www.afp.no',
  'stegvisning.afp.readmore_offentlig_title':
    'Om avtalefestet pensjon i offentlig sektor',
  'stegvisning.afp.readmore_offentlig_list_item1': 'er en livsvarig pensjon',
  'stegvisning.afp.readmore_offentlig_list_item2':
    'kan taes ut sammen med arbeid',
  'stegvisning.afp.readmore_offentlig_list_item3':
    'må taes ut sammen med alderspensjon fra folketrygden (NAV) og tjenestepensjon',
  'stegvisning.afp.readmore_offentlig_ingress':
    'Vi kan ikke innhente opplysninger om dette og ta det med i beregningen. Sjekk hva som gjelder deg hos din tjenestepensjonsordning',
  'stegvisning.afp.radio_label': 'Har du rett til AFP?',
  'stegvisning.afp.radio_ja_offentlig': 'Ja, i offentlig sektor',
  'stegvisning.afp.radio_ja_privat': 'Ja, i privat sektor',
  'stegvisning.afp.radio_nei': 'Nei',
  'stegvisning.afp.radio_vet_ikke': 'Vet ikke',
  'stegvisning.afp.alert_ja_offentlig':
    'NAV kan ikke beregne AFP i offentlig sektor, men du kan likevel fortsette og beregne alderspensjon fra NAV.',
  'stegvisning.afp.alert_vet_ikke':
    'AFP blir ikke med i beregningen din. Dette kan påvirke når du kan ta ut alderspensjon.',
  'stegvisning.afp.validation_error': 'Du må svare på om du har rett til AFP.',
  'stegvisning.sivilstand.title': 'Din sivilstand',
  'stegvisning.sivilstand.ingress':
    'Du er registrert som ugift i folkeregisteret. Hvis du har samboer, kan det påvirke beregningen.',
  'stegvisning.sivilstand.radio_label': 'Har du samboer?',
  'stegvisning.sivilstand.radio_ja': 'Ja',
  'stegvisning.sivilstand.radio_nei': 'Nei',
  'stegvisning.sivilstand.validation_error':
    'Du må svare på om du har samboer.',
}
export const getTranslation_nb = () => translations
