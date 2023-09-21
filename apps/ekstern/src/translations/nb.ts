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
    'Vi jobber med å rette feilen. Prøv å last siden på nytt eller prøv igjen senere.',
  'error.global.button.primary': 'Last siden på nytt',
  'error.global.button.secondary': 'Avbryt',
  'error.404.title': 'Oops! Siden du leter etter finnes ikke.',
  'error.404.list_item1':
    'Hvis du skrev inn adressen direkte i nettleseren kan du sjekke om den er stavet riktig.',
  'error.404.list_item2':
    'Hvis du klikket på en lenke er den feil eller utdatert.',
  'error.404.button.link_1': 'Til pensjonskalkulator',
  'error.404.button.link_2': 'Les om pensjon',
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
    'Du er eller har vært medlem i en offentlig tjenestepensjonsordning og kan ha rett til tjenestepensjon. Men vi kan dessverre ikke hente inn dine avtaler. Sjekk hva som gjelder deg hos din tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring m.fl.)',
  'stegvisning.offentligtp.ingress_2':
    'Du kan likevel gå videre for å beregne alderspensjon fra NAV og pensjonsavtaler i privat sektor.',
  'stegvisning.offentligtp.error.title':
    'Vi klarte ikke å sjekke om du har pensjonsavtaler fra offentlig sektor',
  'stegvisning.offentligtp.error.ingress':
    'Vi kan dessverre ikke hente inn avtaler om tjenestepensjon fra offentlig sektor. Har du vært eller er ansatt i offentlig sektor, kan du sjekke hos aktuell tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring m.fl.). {br}{br}Du kan likevel gå videre for å beregne alderspensjon fra NAV og pensjonsavtaler fra privat sektor.',
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
    'Les om vilkårene til <afpLink>AFP i privat sektor på afp.no</afpLink>',
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
  'stegvisning.sivilstand.ingress_1': 'Du er registrert som ',
  'stegvisning.sivilstand.ingress_2':
    ' i Folkeregisteret. Hvis du har samboer, kan det påvirke beregningen.',
  'stegvisning.sivilstand.radio_label': 'Har du samboer?',
  'stegvisning.sivilstand.radio_ja': 'Ja',
  'stegvisning.sivilstand.radio_nei': 'Nei',
  'stegvisning.sivilstand.validation_error':
    'Du må svare på om du har samboer.',
  'beregning.button.faerre_aar': 'Færre år',
  'beregning.button.flere_aar': 'Flere år',
  'beregning.pensjonsavtaler.error':
    'Vi klarte ikke å hente <link>pensjonsavtalene dine</link>',
  'beregning.pensjonsavtaler.error.partial':
    'Vi klarte ikke å hente alle <link>pensjonsavtalene dine</link>',
  'beregning.pensjonsavtaler.info':
    'Du har pensjonsavtaler som starter før valgt alder. Se detaljer i grunnlaget under.',
  'grunnlag.title': 'Grunnlaget for beregningen',
  'grunnlag.ingress':
    'Pensjonsberegningen er gjort med dagens regelverk og er vist i dagens kroneverdi før skatt.',
  'grunnlag.tidligstmuliguttak.title': 'Tidligst mulig uttak',
  'grunnlag.tidligstmuliguttak.title.error': 'Ikke funnet',
  'grunnlag.tidligstmuliguttak.ingress':
    'For å starte uttak før 67 år må opptjeningen være høy nok. Alle kan derfor ikke starte uttak ved 62 år. Tidspunktet er et estimat på når du tidligst kan ta ut 100 % alderspensjon. I <detaljertKalkulatorLink>detaljert kalkulator</detaljertKalkulatorLink> kan du sjekke om du kan ta ut alderspensjon tidligere med en lavere uttaksgrad.{br}{br}Når du velger uttaksalder, bruker vi måneden etter du fyller år. Velger du for eksempel 62 år, betyr det måneden etter du fyller 62 år.',
  'grunnlag.tidligstmuliguttak.ingress.error':
    'Vi klarte ikke å finne tidspunkt for når du tidligst kan ta ut alderspensjon. Prøv igjen senere.{br}{br}',
  'grunnlag.uttaksgrad.title': 'Uttakgsgrad',
  'grunnlag.uttaksgrad.ingress':
    'Denne beregningen viser 100 % uttak av alderspensjon. I <detaljertKalkulatorLink>detaljert kalkulator</detaljertKalkulatorLink> kan du beregne alderspensjon med andre uttaksgrader (20 %, 40 %, 50 %, 60 % og 80 %). Du kan jobbe så mye du vil ved siden av pensjon selv om du har tatt ut 100 %.',
  'grunnlag.inntekt.title': 'Inntekt',
  'grunnlag.inntekt.ingress':
    'Beløpet er din siste pensjonsgivende årsinntekt {aarsinntekt} fra Skatteetaten. Inntekten blir brukt som din fremtidige inntekt frem til du starter uttak av pensjon. Ønsker du å endre fremtidig inntekt, må du bruke <detaljertKalkulatorLink>detaljert kalkulator</detaljertKalkulatorLink>.',
  'grunnlag.sivilstand.title': 'Sivilstand',
  'grunnlag.sivilstand.title.error': 'Kunne ikke hentes',
  'grunnlag.sivilstand.ingress':
    'Hvis du har lav opptjening kan størrelsen på alderspensjonen din avhenge av om du bor alene eller sammen med noen. <garantiPensjonLink>Mer om garantipensjon og satser</garantiPensjonLink>',
  'grunnlag.opphold.title': 'Opphold i Norge',
  'grunnlag.opphold.ingress':
    'Beregningen forutsetter at du har bodd eller jobbet i Norge i minst 40 år fra fylte 16 år frem til du tar ut pensjon. Ved  utlandsopphold over 5 år, må du bruke <detaljertKalkulatorLink>detaljert kalkulator</detaljertKalkulatorLink>. ',
  'grunnlag.alderspensjon.title': 'Alderspensjon',
  'grunnlag.alderspensjon.ingress':
    'Alderspensjon beregnes ut ifra <dinPensjonLink>din pensjonsbeholdning</dinPensjonLink> i folketrygden. Hvis du fortsetter å ha inntekt samtidig som du tar ut pensjon, vil din alderspensjon øke.{br}{br}<alderspensjonsreglerLink>Om reglene for alderspensjon</alderspensjonsreglerLink>',
  'grunnlag.afp.title': 'Avtalefestet pensjon',
  'grunnlag.afp.ingress.null': '-',
  'grunnlag.afp.ingress.ja_offentlig':
    'Vi kan ikke vise din AFP fordi regelverket for ny AFP i offentlig sektor ikke er endelig avklart. For mer informasjon sjekk din tjenestepensjonsordning.',
  'grunnlag.afp.ingress.ja_privat':
    'NAV har ikke vurdert om du fyller inngangsvilkårene for å få AFP, men forutsetter at du gjør det i beregningen. Les mer om vilkårene for AFP hos <afpLink>Fellesordningen for AFP</afpLink>.',
  'grunnlag.afp.ingress.vet_ikke':
    'Hvis du er usikker på om du har rett til AFP bør du spørre din arbeidsgiver. AFP kan påvirke når du kan ta ut alderspensjon.',
  'grunnlag.afp.ingress.nei':
    'Hvis du starter i jobb hos en arbeidsgiver som har avtale om AFP, anbefaler vi at du gjør en ny beregning.',
  'grunnlag.pensjonsavtaler.title': 'Pensjonsavtaler',
  'grunnlag.pensjonsavtaler.title.error.samtykke': 'Ikke innhentet',
  'grunnlag.pensjonsavtaler.title.error.pensjonsavtaler': 'Kunne ikke hentes',
  'grunnlag.pensjonsavtaler.title.error.pensjonsavtaler.partial':
    '(Avtaler mangler))',
  'grunnlag.pensjonsavtaler.ingress':
    'Alle avtaler i privat sektor er hentet fra <norskPensjonLink>Norsk Pensjon</norskPensjonLink>. Du kan ha andre avtaler enn det som finnes i Norsk Pensjon. Kontakt aktuell pensjonsordning.{br}{br}Vi kan ikke hente pensjonsavtaler fra offentlig sektor. Sjekkaktuell tjenestepensjonsordning.',
  'grunnlag.pensjonsavtaler.ingress.error.samtykke':
    'Du har ikke samtykket til å hente inn pensjonsavtaler om tjenestepensjon. <startLink>Start en ny beregning</startLink> dersom du ønsker å få dette i beregningen.',
  'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler':
    'Vi klarte ikke å hente pensjonsavtalene dine fra Norsk Pensjon. Prøv igjen senere.',
  'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler.partial':
    'Vi klarte ikke å hente alle pensjonsavtalene dine fra Norsk Pensjon. Prøv igjen senere.',
  'grunnlag.pensjonsavtaler.ingress.ingen': 'Vi fant ingen pensjonsavtaler.',
  'grunnlag.pensjonsavtaler.tabell.title.left': 'Pensjonsavtaler',
  'grunnlag.pensjonsavtaler.tabell.title.right': 'Årlig beløp',
}
export const getTranslation_nb = () => translations
