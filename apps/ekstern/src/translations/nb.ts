const translations = {
  'application.title': 'Pensjonskalkulator – Pensjon',
  'application.title.stegvisning.start': 'Start – Pensjonskalkulator',
  'application.title.stegvisning.sivilstand': 'Sivilstand – Pensjonskalkulator',
  'application.title.stegvisning.utenlandsopphold':
    'Utenlandsopphold – Pensjonskalkulator',
  'application.title.stegvisning.afp': 'AFP – Pensjonskalkulator',
  'application.title.stegvisning.ufoeretryg_AFP':
    'Uføretrygd og AFP – Pensjonskalkulator',
  'application.title.stegvisning.samtykke_offentlig_AFP':
    'Samtykke AFP offentlig – Pensjonskalkulator',
  'application.title.stegvisning.samtykke': 'Samtykke – Pensjonskalkulator',
  'application.title.stegvisning.uventet_feil':
    'Uventet feil – Pensjonskalkulator',
  'application.title.stegvisning.kalkulator_virker_ikke':
    'Kalkulatoren virker ikke – Pensjonskalkulator',
  'application.title.securityLevel_feil':
    'For lavt sikkerhetsnivå – Pensjonskalkulator',
  'application.title.beregning': 'Beregning – Pensjonskalkulator',
  'application.title.forbehold': 'Forbehold – Pensjonskalkulator',
  'application.title.personopplysninger':
    'Personopplysninger i enkel kalkulator – Pensjonskalkulator',
  'application.global.external_link': 'åpner i en ny fane',
  'application.global.retry': 'Prøv på nytt',
  'pageframework.title': 'Pensjonskalkulator',
  'pageframework.loading': 'Vent litt mens vi henter informasjon.',
  'error.securityLevel.title': 'Du kan ikke logge inn i kalkulatoren med MinID',
  'error.securityLevel.ingress':
    'For å bruke kalkulatoren må du logge inn med et høyere sikkerhetsnivå, f.eks. BankID, Buypass eller Commfides.',
  'error.securityLevel.primary_button': 'Logg inn på nytt',
  'error.securityLevel.secondary_button': 'Avbryt',
  'error.fullmakt.title':
    'Du kan ikke bruke kalkulatoren på vegne av denne brukeren',
  'error.fullmakt.ingress':
    'Gå videre for å se hva du kan gjøre på vegne av denne brukeren eller bytte bruker.',
  'error.fullmakt.bytt_bruker': 'Gå videre til Bytt bruker',
  'error.global.title': 'Oops! Det har oppstått en uventet feil.',
  'error.global.ingress': 'Vi jobber med å rette feilen. Prøv igjen senere.',
  'error.global.button': 'Avbryt',
  'error.du_kan_ikke_bruke_enkel_kalkulator':
    'Du kan dessverre ikke bruke denne kalkulatoren',
  'error.404.title': 'Oops! Siden du leter etter finnes ikke.',
  'error.404.list_item1':
    'Hvis du skrev inn adressen direkte i nettleseren kan du sjekke om den er stavet riktig.',
  'error.404.list_item2':
    'Hvis du klikket på en lenke er den feil eller utdatert.',
  'error.404.button.link_1': 'Gå til pensjonskalkulator',
  'error.404.button.link_2': 'Les om pensjon',
  'error.virker_ikke.title': 'Beklager, kalkulatoren virker ikke akkurat nå',
  'error.virker_ikke.ingress':
    'En feil har skjedd hos oss som gjør at du dessverre ikke kan bruke kalkulatoren. Vi jobber med å rette feilen. Prøv igjen senere.{br}{br}Hvis problemet vedvarer, kan du {kontaktoss} ',
  'error.virker_ikke.link': 'kontakte oss',
  'error.virker_ikke.button': 'Gå til Din pensjon',
  'error.apoteker_warning':
    'Hvis du er medlem av Pensjonsordningen for apotekvirksomhet (POA) er beregning med AFP for øyeblikket feil. Prøv igjen senere.',
  'landingsside.for.deg.som.kan.logge.inn': 'For deg som kan logge inn',
  'landingsside.for.deg.foedt.foer.1963': 'For deg født før 1963',
  'landingsside.du.maa.bruke.detaljert':
    'Du må bruke vår detaljerte kalkulator. Den gir deg et estimat på',
  'landingsside.velge_mellom_detaljert_og_enkel':
    'I pensjonskalkulatoren kan du få et estimat på ',
  'landingsside.button.enkel_kalkulator_utlogget':
    'Logg inn i pensjonskalkulator',
  'landingsside.button.enkel_kalkulator': 'Pensjonskalkulator',
  'landingsside.text.uinnlogget_kalkulator': 'For deg som ikke kan logge inn',
  'landingsside.button.uinnlogget_kalkulator': 'Uinnlogget kalkulator',
  'landingsside.body.uinnlogget_kalkulator':
    'Du kan bruke vår uinnloggede kalkulator. Den henter ikke inn eller lagrer noen opplysninger om deg. Du må finne og oppgi alle opplysningene selv. Kalkulatoren gir deg et estimat på alderspensjon fra folketrygden (Nav) og AFP (avtalefestet pensjon) i privat sektor. Hvis du mottar uføretrygd eller andre ytelser, tar vi ikke hensyn til dette i kalkulatoren. Du bør derfor bruke den innloggede kalkulatoren.',
  'landingsside.link.personopplysninger':
    'Personopplysninger som brukes i pensjonskalkulator',
  'stegvisning.radio_ja': 'Ja',
  'stegvisning.radio_nei': 'Nei',
  'stegvisning.neste': 'Neste',
  'stegvisning.tilbake': 'Tilbake',
  'stegvisning.avbryt': 'Avbryt',
  'stegvisning.tilbake_start': 'Tilbake til start',
  'stegvisning.tilbake_start.modal.title':
    'Hvis du går tilbake til start, mister du alle valgene dine.',
  'stegvisning.tilbake_start.modal.bekreft': 'Gå tilbake til start',
  'stegvisning.tilbake_start.modal.avbryt': 'Avbryt',
  'stegvisning.fremtidigvedtak.alert':
    'Du har vedtak om {grad} % alderspensjon fra {fom}. Frem til denne datoen kan du gjøre en ny beregning av andre alternativer.',
  'stegvisning.start.title': 'Hei',
  'stegvisning.start.endring.ingress_1a': `Du har nå <strong>{grad} % alderspensjon</strong>{
      ufoeretrygd,  select,     0 {} other { og <strong>{ufoeretrygd} % uføretrygd</strong>}}{
      afpPrivat,    select, false {} other { og <strong>AFP i privat sektor</strong>}}{
      afpOffentlig, select, false {} other { og <strong>AFP i offentlig sektor</strong>}}. `,
  'stegvisning.start.endring.ingress_1b.uten_fremtidig':
    'Her kan du sjekke hva du kan få hvis du vil endre alderspensjonen din.{br}{br}',
  'stegvisning.start.endring.ingress_1b.med_fremtidig':
    'Du har endret til <strong>{grad} % alderspensjon fra {fom}</strong>. Du kan ikke gjøre en ny beregning her før denne datoen.{br}{br}Har du spørsmål, kan du kontakte oss på telefon <nowrap>{link}</nowrap>.',
  'stegvisning.start.ingress.pre2025_offentlig_afp':
    'Du har nå <strong>AFP i offentlig sektor</strong>. Her kan du sjekke hva du kan få i alderspensjon.{br}{br}',
  'stegvisning.start.endring.ingress.pre2025_offentlig_afp':
    'Du har nå <strong>{grad} % alderspensjon</strong> og <strong>AFP i offentlig sektor</strong>. Her kan du sjekke hva du kan få i alderspensjon.{br}{br}',
  'stegvisning.start.endring.ingress.pre2025_offentlig_afp_fremtidig':
    'Du har nå <strong>0 % alderspensjon</strong>. Du har endret til <strong>{grad} % alderspensjon fra {fom}</strong>. Du kan ikke gjøre en ny beregning her før denne datoen.{br}{br}Har du spørsmål, kan du kontakte oss på telefon <nowrap>{link}</nowrap>.',
  'stegvisning.start.ingress':
    'Velkommen til pensjonskalkulatoren som kan vise deg:',
  'stegvisning.start.list_item1': 'alderspensjon (Nav)',
  'stegvisning.start.list_item2': 'AFP (avtalefestet pensjon)',
  'stegvisning.start.list_item3': 'pensjonsavtaler (arbeidsgivere m.m.)',
  'stegvisning.start.endring.ingress_2':
    'Du må svare på alle spørsmålene som kommer.',
  'stegvisning.start.ingress_2':
    'For å få et estimat på pensjonen din, må du svare på alle spørsmålene som kommer.',
  'stegvisning.start.button': 'Kom i gang',
  'stegvisning.start.link':
    'Personopplysninger som brukes i pensjonskalkulator',
  'stegvisning.start_brukere_fyllt_75.title':
    'Du kan dessverre ikke beregne alderspensjon i kalkulatoren etter at du har fylt 75 år',
  'stegvisning.start_brukere_fyllt_75.ingress':
    'Har du spørsmål, kan du <planleggePensjonLink>kontakte oss</planleggePensjonLink>',
  'stegvisning.start_brukere_fyllt_75.button': 'Gå til Din pensjon',
  'stegvisning.start_brukere_fyllt_75.avbryt': 'Avbryt',
  'stegvisning.utenlandsopphold.title': 'Opphold utenfor Norge',
  'stegvisning.utenlandsopphold.ingress':
    'Har du bodd eller jobbet mer enn 5 år utenfor Norge mellom fylte 16 år og uttak av pensjon? Det kan påvirke alderspensjonen din.',
  'stegvisning.utenlandsopphold.radio_label':
    'Har du bodd eller jobbet utenfor Norge i mer enn 5 år?',
  'stegvisning.utenlandsopphold.radio_label.description':
    'Fra du fylte 16 år til du tar ut pensjon',
  'stegvisning.utenlandsopphold.radio_ja': 'Ja',
  'stegvisning.utenlandsopphold.radio_nei': 'Nei',
  'stegvisning.utenlandsopphold.validation_error':
    'Du må svare på om du har bodd eller jobbet utenfor Norge i mer enn 5 år etter fylte 16 år.',
  'stegvisning.utenlandsopphold.mangler_opphold.validation_error':
    'Du må legge til minst ett opphold eller svare «Nei» på om du har bodd eller jobbet utenfor Norge i mer enn 5 år.',
  'stegvisning.utenlandsopphold.ingress.bottom':
    'Hvis du ikke skal bo i Norge når du mottar pensjon, bør du undersøke reglene for eksport. Kalkulatoren vurderer ikke om du har rett til å motta hele alderspensjonen hvis du er bosatt utenfor Norge.',
  'stegvisning.utenlandsopphold.oppholdene.title':
    'Oppholdene dine utenfor Norge',
  'stegvisning.utenlandsopphold.oppholdene.description':
    'Legg til gjennomførte og planlagte opphold',
  'stegvisning.utenlandsopphold.oppholdene.description.periode': 'Periode: ',
  'stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold':
    '(Varig opphold)',
  'stegvisning.utenlandsopphold.oppholdene.description.har_jobbet': 'Jobbet: ',
  'stegvisning.utenlandsopphold.oppholdene.description.har_jobbet.ja': 'Ja',
  'stegvisning.utenlandsopphold.oppholdene.description.har_jobbet.nei': 'Nei',
  'stegvisning.utenlandsopphold.oppholdene.button.legg_til': 'Legg til opphold',
  'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt':
    'Legg til nytt opphold',
  'stegvisning.utenlandsopphold.oppholdene.button.endre': 'Endre opphold',
  'stegvisning.utenlandsopphold.oppholdene.button.slette': 'Slett opphold',
  'utenlandsopphold.om_oppholdet_ditt_modal.title': 'Om oppholdet ditt',
  'utenlandsopphold.om_oppholdet_ditt_modal.button.legg_til':
    'Legg til opphold',
  'utenlandsopphold.om_oppholdet_ditt_modal.button.oppdater':
    'Oppdater opphold',
  'utenlandsopphold.om_oppholdet_ditt_modal.button.avbryt': 'Avbryt',
  'utenlandsopphold.om_oppholdet_ditt_modal.button.avbryt_endring':
    'Avbryt endring',
  'utenlandsopphold.om_oppholdet_ditt_modal.land.label': 'Velg land',
  'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.label':
    'Jobbet du i {land}?',
  'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description':
    'Hvis du jobbet i deler av oppholdet, bør du legge til perioden du jobbet og perioden du ikke jobbet som to ulike opphold.',
  'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.radio_ja': 'Ja',
  'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.radio_nei': 'Nei',
  'utenlandsopphold.om_oppholdet_ditt_modal.startdato.label': 'Oppgi startdato',
  'utenlandsopphold.om_oppholdet_ditt_modal.startdato.description':
    'Hvis du ikke vet nøyaktige datoer, oppgi omtrentlige datoer.',
  'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.label': 'Oppgi sluttdato',
  'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.description':
    'Ved varig opphold, lar du feltet stå tomt.',
  'utenlandsopphold.om_oppholdet_ditt_modal.land.validation_error':
    'Du må velge land for oppholdet ditt.',
  'utenlandsopphold.om_oppholdet_ditt_modal.arbeidet_utenlands.validation_error':
    'Du må svare «Ja» eller «Nei» på om du jobbet under oppholdet.',
  'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.format':
    'Oppgi dag, måned og år som DD.MM.ÅÅÅÅ.',
  'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.after_max':
    'Sluttdato kan ikke være senere enn {maxDato}.',
  'utenlandsopphold.om_oppholdet_ditt_modal.startdato.validation_error.required':
    'Du må oppgi startdato for oppholdet ditt.',
  'utenlandsopphold.om_oppholdet_ditt_modal.startdato.validation_error.before_min':
    'Startdato kan ikke være før fødselsdatoen din.',
  'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.validation_error.before_min':
    'Sluttdato kan ikke være før startdato.',
  'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.validation_error.required':
    'Du kan bare ha ett varig opphold. Fyll ut sluttdato for oppholdet ditt.',
  'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.ikke_avtaleland':
    'Du har allerede registrert at du har bodd i {land} fra {periodestart} til {periodeslutt}. Du kan ikke ha overlappende opphold med landet {land}.',
  'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.ulike_land':
    'Du har allerede registrert at du har bodd i {land} fra {periodestart} til {periodeslutt}. Du kan ikke ha overlappende opphold i to ulike land.',
  'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.bostatus':
    'Du har allerede registrert at du har bodd i {land} fra {periodestart} til {periodeslutt}. Du kan ikke ha overlappende boopphold.',
  'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.jobbstatus':
    'Du har allerede registrert at du har jobbet i {land} fra {periodestart} til {periodeslutt}. Du kan ikke ha overlappende jobbperioder.',
  'utenlandsopphold.slette_modal.title':
    'Er du sikker på at du vil slette oppholdet ditt?',
  'utenlandsopphold.slette_modal.button.avbryt': 'Avbryt',
  'utenlandsopphold.slette_modal.button.slett': 'Slett opphold',
  'stegvisning.samtykke_pensjonsavtaler.title': 'Pensjonsavtaler',
  'stegvisning.samtykke_pensjonsavtaler.ingress':
    'Vil du se tjenestepensjon og andre pensjonsavtaler i kalkulatoren, må du samtykke til at Nav henter disse opplysningene fra andre pensjonsordninger. Samtykket er frivillig.{br}{br} Hvis du svarer nei, får du beregnet alderspensjon (Nav) og eventuell AFP (avtalefestet pensjon).',
  'stegvisning.samtykke_pensjonsavtaler.radio_label':
    'Skal vi hente pensjonsavtalene dine?',
  'stegvisning.samtykke_pensjonsavtaler.radio_description':
    'Samtykket gjelder bare for beregninger i denne kalkulatoren, frem til du logger ut.',
  'stegvisning.samtykke_pensjonsavtaler.radio_ja': 'Ja',
  'stegvisning.samtykke_pensjonsavtaler.radio_nei': 'Nei, fortsett uten',
  'stegvisning.samtykke_pensjonsavtaler.validation_error':
    'Du må svare på om du vil at vi skal hente dine pensjonsavtaler.',
  'stegvisning.afp.title': 'AFP (avtalefestet pensjon)',
  'stegvisning.afpPrivat.title': 'AFP (avtalefestet pensjon) i privat sektor',
  'stegvisning.afp.ingress':
    'For å få AFP må arbeidsgiveren din ha en slik avtale og du må kvalifisere til å få den.',
  'stegvisning.afp.readmore_offentlig_list_title': 'AFP i offentlig sektor:',
  'stegvisning.afpOvergangskull.readmore_offentlig_title':
    'Om AFP i offentlig sektor',
  'stegvisning.afpOvergangskull.readmore_offentlig_list_item1':
    'kan tas ut mellom 62 og 67 år',
  'stegvisning.afpOvergangskull.readmore_offentlig_list_item2':
    'reduseres mot inntekt',
  'stegvisning.afpOvergangskull.readmore_offentlig_list_item3':
    'kan ikke tas ut sammen med alderspensjon fra folketrygden (Nav)',
  'stegvisning.afpOvergangskull.readmore_offentlig_ingress':
    'De fleste statlige, fylkeskommunale og kommunale arbeidsgivere har avtale om AFP. Enkelte arbeidsgivere i privat sektor kan ha avtaler i offentlig sektor. Hvis du er usikker på hva som gjelder for deg, sjekk hos arbeidsgiveren din.',
  'stegvisning.afp.radio_label': 'Har du rett til AFP?',
  'stegvisning.afp.radio_ja_offentlig': 'Ja, i offentlig sektor',
  'stegvisning.afp.radio_ja_privat': 'Ja, i privat sektor',
  'stegvisning.afp.radio_nei': 'Nei',
  'stegvisning.afp.radio_vet_ikke': 'Vet ikke',
  'stegvisning.afpPrivat.radio_label': 'Har du rett til AFP i privat sektor?',
  'stegvisning.afp.overgangskullUtenAP.radio_label': 'Hva vil du beregne?',
  'stegvisning.afp.overgangskullUtenAP.radio_ja':
    'AFP etterfulgt av alderspensjon fra 67 år',
  'stegvisning.afp.overgangskullUtenAP.radio_nei': 'Kun alderspensjon',
  'stegvisning.afp.alert_vet_ikke':
    'Er du usikker, bør du sjekke med arbeidsgiveren din.',
  'stegvisning.afp.validation_error': 'Du må svare på om du har rett til AFP.',
  'stegvisning.afpPrivat.validation_error':
    'Du må svare på om du har rett til AFP i privat sektor.',
  'stegvisning.afpOverganskull.validation_error':
    'Du må svare på om du vil beregne AFP etterfulgt av alderspensjon fra 67 år eller kun alderspensjon.',
  'stegvisning.ufoere.title': 'Uføretrygd og AFP (avtalefestet pensjon)',
  'stegvisning.ufoere.info':
    'Før du fyller 62 år må du velge mellom å få AFP eller å beholde uføretrygden. {br}{br} AFP og uføretrygd kan ikke kombineres. Hvis du ikke gir oss beskjed, mister du retten til AFP (men beholder uføretrygden).',
  'stegvisning.ufoere.ingress':
    'Du kan få hjelp til å vurdere alternativene dine. Kontakt tjenestepensjonsordningen din hvis du jobber i offentlig sektor. <planleggePensjonLink>Kontakt Nav</planleggePensjonLink> hvis du jobber i privat sektor.',
  'stegvisning.samtykke_offentlig_afp.title':
    'Samtykke til at Nav beregner AFP (avtalefestet pensjon)',
  'stegvisning.samtykke_offentlig_afp.ingress':
    'Tjenestepensjonsordningen din har ansvar for livsvarig AFP i offentlig sektor. De vil vurdere om du fyller vilkårene og gjør den endelige beregningen når du søker om AFP. Kontakt dem hvis du har spørsmål.{br}{br}Nav vurderer ikke om du har rett til AFP, men kan gi deg en foreløpig beregning på AFP i denne kalkulatoren. ',
  'stegvisning.samtykke_offentlig_afp.radio_label':
    'Vil du at Nav skal beregne AFP for deg?',
  'stegvisning.samtykke_offentlig_afp.radio_description':
    'Samtykket gjelder bare for beregninger i denne kalkulatoren, frem til du logger ut.',
  'stegvisning.samtykke_offentlig_afp.radio_ja': 'Ja',
  'stegvisning.samtykke_offentlig_afp.radio_nei': 'Nei, fortsett uten',
  'stegvisning.samtykke_offentlig_afp.validation_error':
    'Du må svare på om du vil at Nav skal beregne AFP for deg.',
  'stegvisning.sivilstand.title': 'Sivilstand',
  'stegvisning.sivilstand.ingress_ukjent':
    'Bor du sammen med noen? Det kan ha betydning for hva du får i pensjon.',
  'stegvisning.sivilstand.ingress_1':
    'Bor du sammen med noen? Det kan ha betydning for hva du får i pensjon. Du er registrert som ',
  'stegvisning.sivilstand.ingress_2': ' i Folkeregisteret.',
  'stegvisning.sivilstand.select_label':
    'Hva er sivilstanden din når du skal ta ut pensjon?',
  'stegvisning.sivilstand.select_description_ukjent':
    'Dette gjelder kun beregninger i kalkulatoren.',
  'stegvisning.sivilstand.select_description':
    'Hvis du endrer, gjelder det kun beregninger i kalkulatoren.',
  'stegvisning.sivilstand.radio_epsHarPensjon_label':
    'Vil {sivilstand} motta pensjon eller uføretrygd fra folketrygden, eller AFP?',
  'stegvisning.sivilstand.radio_epsHarPensjon_description':
    'Når du skal ta ut pensjon',
  'stegvisning.sivilstand.radio_epsHarInntektOver2G_label':
    'Vil {sivilstand} ha inntekt over 2G{grunnbeloep}?',
  'stegvisning.sivilstand.radio_epsHarInntektOver2G_description':
    'Gjelder kalenderåret du tar ut pensjon. Alle inntekter skal regnes med, også kapitalinntekter og pensjon fra andre enn Nav.',
  'stegvisning.sivilstand.radio_label': 'Har du samboer eller ektefelle?',
  'stegvisning.sivilstand.radio_ja': 'Ja',
  'stegvisning.sivilstand.radio_nei': 'Nei',
  'stegvisning.sivilstand.select_validation_error':
    'Du må velge en sivilstand.',
  'stegvisning.sivilstand.epsHarPensjon.validation_error':
    'Du må svare på om {sivilstand} vil motta pensjon eller uføretrygd fra folketrygden, eller AFP.',
  'stegvisning.sivilstand.epsHarInntektOver2G.validation_error':
    'Du må svare på om {sivilstand} vil ha inntekt over 2G.',
  'stegvisning.sivilstand.ektefellen': 'ektefellen din',
  'stegvisning.sivilstand.samboeren': 'samboeren din',
  'stegvisning.sivilstand.partneren': 'partneren din',
  'agepicker.validation_error.aar': 'Du må velge år og måned',
  'agepicker.validation_error.maaneder': 'Du må velge måned',
  'string.og': 'og',
  'string.fra': 'fra',
  'string.til': 'til',
  'alder.md': 'md.',
  'alder.maaned': 'måned',
  'alder.maaneder': 'måneder',
  'alder.aar': 'år',
  'alder.aar_livsvarig': 'år (livsvarig)',
  'afp.offentlig': 'Offentlig',
  'afp.privat': 'Privat',
  'afp.nei': 'Nei',
  'afp.vet_ikke': 'Vet ikke',
  'sivilstand.GIFT': 'Gift',
  'sivilstand.UGIFT': 'Ugift',
  'sivilstand.REGISTRERT_PARTNER': 'Registrert partner',
  'sivilstand.ENKE_ELLER_ENKEMANN': 'Enke/enkemann',
  'sivilstand.SKILT': 'Skilt',
  'sivilstand.SEPARERT': 'Separert',
  'sivilstand.SEPARERT_PARTNER': 'Separert partner',
  'sivilstand.SAMBOER': 'Samboer',
  'sivilstand.SKILT_PARTNER': 'Skilt partner',
  'sivilstand.GJENLEVENDE_PARTNER': 'Gjenlevende partner',
  'sivilstand.med_samboer': 'med samboer',
  'sivilstand.uten_samboer': 'uten samboer',
  'tidligstmuliguttak.ingress_1':
    'Beregningen din viser at du kan ta ut <nowrap>100 %</nowrap> alderspensjon fra du er ',
  'tidligstmuliguttak.1963.ingress_2':
    ' Hvis du venter lenger med uttaket, vil den årlige pensjonen din øke.',
  'tidligstmuliguttak.1964.ingress_2':
    ' Det kan bli senere fordi pensjonsalderen i Norge øker.',
  'tidligstmuliguttak.pre2025OffentligAfp.ingress':
    'Du har AFP i offentlig sektor. Her kan du beregne 100 % alderspensjon fra 67 år. Vil du beregne uttak før 67 år, må du gå til {link}.',
  'tidligstmuliguttak.pre2025OffentligAfp.avansert_link': 'Avansert',
  'tidligstmuliguttak.info_omstillingsstoenad_og_gjenlevende':
    'Alderspensjon kan ikke kombineres med gjenlevendepensjon eller omstillingsstønad. Ønsker du å ta ut alderspensjon før <nowrap>{normertPensjonsalder}</nowrap>, må du si fra deg gjenlevendepensjon eller omstillingsstønad når du tar ut alderspensjon. Har du spørsmål, kan du kontakte oss på telefon <nowrap>{link}</nowrap>.',
  'tidligstmuliguttak.error':
    'I Avansert kan du velge en mer nøyaktig pensjonsalder.',
  'omufoeretrygd.hel.ingress':
    'Du har <nowrap>100 %</nowrap> uføretrygd. Her kan du beregne <nowrap>100 %</nowrap> alderspensjon fra <nowrap>{normertPensjonsalder}</nowrap>.{br}{br}Kommende lovendringer vil gradvis øke pensjonsalderen.',
  'omufoeretrygd.gradert.ingress':
    'Du har <nowrap>{grad} %</nowrap> uføretrygd. Her kan du beregne <nowrap>100 %</nowrap> alderspensjon fra <nowrap>{normertPensjonsalder}</nowrap>. Vil du beregne uttak før <nowrap>{normertPensjonsalder}</nowrap>, må du gå til {link}.{br}{br}Kommende lovendringer vil gradvis øke pensjonsalderen.',
  'omufoeretrygd.gradert.ingress.afp':
    'Du har <nowrap>{grad} %</nowrap> uføretrygd. Her kan du beregne <nowrap>100 %</nowrap> alderspensjon og pensjonsavtaler fra <nowrap>{normertPensjonsalder}</nowrap>.{br}{br}I {link} kan du beregne kombinasjoner av alderspensjon og uføretrygd før <nowrap>{normertPensjonsalder}</nowrap> eller alderspensjon og AFP fra {nedreAldersgrense}.{br}{br}Kommende lovendringer vil gradvis øke pensjonsalderen.',
  'omufoeretrygd.avansert_link': 'Avansert',
  'velguttaksalder.title': 'Når vil du ta ut alderspensjon?',
  'velguttaksalder.endring.title': 'Når vil du endre alderspensjonen din?',
  'velguttaksalderafp.title': 'Når vil du ta ut AFP?',
  'beregning.intro.title': 'Estimert pensjon',
  'beregning.intro.title.endring': 'Beregning',
  'beregning.intro.description_1': 'Alle beløp vises i dagens verdi før skatt.',
  'beregning.intro.description_1.endring':
    'Estimerte beløp i dagens verdi før skatt',
  'beregning.intro.description_2.gradert_UT.med_afp':
    'Hvis du velger AFP, får du ikke uføretrygd etter at du blir 62 år. Uføretrygd vises ikke i beregningen.',
  'beregning.intro.description_2.gradert_UT.uten_afp':
    'Du har {grad} % uføretrygd. Den kommer i tillegg til inntekt og pensjon frem til du blir {normertPensjonsalder}. Uføretrygd vises ikke i beregningen.',
  'beregning.intro.description_2.hel_UT':
    'Du har 100 % uføretrygd. Uføretrygd vises ikke i beregningen.',
  'beregning.toggle.enkel': 'Enkel',
  'beregning.toggle.avansert': 'Avansert',
  'beregning.loading': 'Vent litt mens vi beregner pensjonen din.',
  'beregning.error':
    'Vi klarte dessverre ikke å beregne pensjonen din akkurat nå.',
  'beregning.livsvarig': 'livsvarig',
  'beregning.lav_opptjening.aar':
    'Du har ikke høy nok opptjening til å kunne starte uttak ved {startAar} år{startMaaned}. Prøv en høyere alder.',
  'beregning.button.faerre_aar': 'Færre år',
  'beregning.button.flere_aar': 'Flere år',
  'beregning.pensjonsavtaler.alert.endring':
    'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.',
  'beregning.pensjonsavtaler.alert.stoettes_ikke':
    'Beregningen viser kanskje ikke alt. Du kan ha rett til offentlig tjenestepensjon. Les mer under <scrollTo>pensjonsavtaler</scrollTo>.',
  'beregning.pensjonsavtaler.alert.privat.error':
    'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i privat sektor. Les mer under <scrollTo>pensjonsavtaler</scrollTo>.',
  'beregning.pensjonsavtaler.alert.offentlig.error':
    'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor. Les mer under <scrollTo>pensjonsavtaler</scrollTo>.',
  'beregning.pensjonsavtaler.alert.privat_og_offentlig.error':
    'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor. Les mer under <scrollTo> pensjonsavtaler</scrollTo>.',
  'beregning.pensjonsavtaler.alert.avtaler_foer_alder':
    'Du har pensjonsavtaler som starter før valgt alder. Se perioder under <scrollTo>Pensjonsavtaler</scrollTo>.',
  'beregning.title': 'Årlig inntekt og pensjon',
  'beregning.alert.inntekt':
    'Fordi du har endret inntekten din, endres pensjonsopptjeningen din.',
  'beregning.highcharts.informasjon_klikk': 'Klikk på søylene for detaljer',
  'beregning.highcharts.title': 'Årlig inntekt og pensjon',
  'beregning.highcharts.ingress': 'Estimerte beløp i dagens verdi før skatt',
  'beregning.highcharts.alt_tekst':
    'Årlig inntekt og pensjon etter uttak i kroner.',
  'beregning.highcharts.xaxis': 'Årlig inntekt og pensjon etter uttak',
  'beregning.highcharts.yaxis': 'Kroner',
  'beregning.highcharts.yaxis.mobile': 'Tusen kroner',
  'beregning.highcharts.serie.inntekt.name': 'Pensjonsgivende inntekt',
  'beregning.highcharts.serie.tp.name': 'Pensjonsavtaler (arbeidsgivere m.m.)',
  'beregning.highcharts.serie.afp.name': 'AFP (avtalefestet pensjon)',
  'beregning.highcharts.serie.alderspensjon.name': 'Alderspensjon (Nav)',
  'beregning.highcharts.tooltip.inntekt': 'Inntekt når du er',
  'beregning.highcharts.tooltip.pensjon': 'Pensjon når du er',
  'beregning.highcharts.tooltip.inntekt_og_pensjon':
    'Inntekt og pensjon når du er',
  'beregning.tabell.lukk': 'Lukk tabell av beregningen',
  'beregning.tabell.vis': 'Vis tabell av beregningen',
  'beregning.tabell.sum': 'Sum',
  'beregning.detaljer.lukk': 'Skjul detaljer om din {ytelse}',
  'beregning.detaljer.vis': 'Vis detaljer om din {ytelse}',
  'beregning.detaljer.grunnpensjon.heltUttak.title':
    'Ved {alderAar} {alderMd} ({grad} %)',
  'beregning.detaljer.grunnpensjon.gradertUttak.title':
    'Ved {alderAar} {alderMd} ({grad} %)',
  'beregning.detaljer.grunnpensjon.afp.table.title':
    'Månedlig avtalefestet pensjon (AFP)',
  'beregning.detaljer.grunnpensjon.table.title':
    'Månedlig alderspensjon fra Nav',
  'beregning.detaljer.grunnpensjon.pre2025OffentligAfp.title':
    'Ved {alderAar} {alderMd}',
  'beregning.detaljer.afpPrivat.heltUttak.title': 'Ved {alderAar} {alderMd}',
  'beregning.detaljer.afpPrivat.gradertUttak.title': 'Ved {alderAar} {alderMd}',
  'beregning.detaljer.afpOffentlig.uttak.title': 'Ved {alderAar} {alderMd}',
  'beregning.detaljer.OpptjeningDetaljer.table.title': 'Opptjening',
  'beregning.detaljer.OpptjeningDetaljer.kap19.table.title':
    'Opptjening etter gamle regler',
  'beregning.detaljer.OpptjeningDetaljer.kap20.table.title':
    'Opptjening etter nye regler',
  'beregning.detaljer.OpptjeningDetaljer.afpPrivat.table.title':
    'Månedlig avtalefestet pensjon (AFP)',
  'beregning.detaljer.OpptjeningDetaljer.pre2025OffentligAfp.table.title':
    'Opptjening avtalefestet pensjon (AFP)',
  'beregning.pdf.ingress':
    'Beregningen din blir ikke lagret hos Nav. Hvis du har behov for å ta vare på eller skrive ut beregningen, kan du laste den ned.',
  'beregning.pdf.button': 'Last ned beregningen som PDF',
  'beregning.avansert.link.endre_valgene_dine': 'Endre valgene dine',
  'beregning.avansert.link.endre_avanserte_valg': 'Endre avanserte valg',
  'beregning.avansert.link.om_vilkaar_for_afp': 'Om vilkår for uttak av AFP',
  'beregning.avansert.endring_banner.title': 'Alderspensjon når du er ',
  'beregning.avansert.endring_banner.kr_md': 'kr/md.',
  'beregning.avansert.maanedsbeloep.table_title': 'Månedlig pensjon',
  'beregning.avansert.maanedsbeloep.box_title': 'Ved ',
  'beregning.avansert.maanedsbeloep.afp': 'AFP (avtalefestet pensjon)',
  'beregning.avansert.maanedsbeloep.pensjonsavtaler':
    'Pensjonsavtaler (arbeidsgivere m.m.)',
  'beregning.avansert.maanedsbeloep.alderspensjon':
    'Alderspensjon (Nav) {prosent} %',
  'beregning.avansert.maanedsbeloep.sum': 'Sum pensjon {maanedOgAar}',
  'beregning.avansert.rediger.inntekt_frem_til_uttak.label':
    'Pensjonsgivende årsinntekt frem til pensjon',
  'beregning.avansert.rediger.inntekt_frem_til_endring.label':
    'Pensjonsgivende årsinntekt frem til endring',
  'beregning.avansert.rediger.inntekt_frem_til_uttak.description_ufoere':
    'Uføretrygd og uførepensjon skal ikke være med.',
  'beregning.avansert.rediger.inntekt_frem_til_uttak.description':
    'kr per år før skatt',
  'beregning.avansert.rediger.pre2025_offentlig_afp.alert':
    'Du beregner nå uttak av alderspensjon før 67 år. AFP i offentlig sektor kan ikke kombineres med alderspensjon. Beregningen forutsetter derfor at du sier fra deg AFP. Kontakt tjenestepensjonsordningen din hvis du vurderer dette.',
  'beregning.avansert.rediger.uttaksgrad.label':
    'Hvor mye alderspensjon vil du ta ut?',
  'beregning.avansert.rediger.uttaksgrad.description': 'Velg uttaksgrad',
  'beregning.avansert.rediger.uttaksgrad.endring.description':
    'Velg ny uttaksgrad',
  'beregning.avansert.rediger.radio.afp_inntekt_maaned_foer_uttak':
    'Forventer du å ha inntekt på minst {afpInntektMaanedFoerUttak} før skatt den siste måneden før du tar ut AFP?',
  'beregning.avansert.rediger.radio.afp_inntekt_maaned_foer_uttak.description':
    'Dette er ett av vilkårene for å få AFP.',
  'beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak':
    'Forventer du å ha inntekt samtidig som du tar ut <nowrap>100 %</nowrap> pensjon?',
  'beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description':
    'Du kan tjene så mye du vil samtidig som du tar ut pensjon.',
  'beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description.validation_error':
    'Du må svare på om du forventer å ha inntekt samtidig som du tar ut <nowrap>100 %</nowrap> pensjon.',
  'beregning.avansert.rediger.radio.inntekt_vsa_afp':
    'Forventer du å ha inntekt samtidig som du tar ut AFP?',
  'beregning.avansert.rediger.radio.inntekt_vsa_afp.description':
    'AFP-graden du får, beregnes etter hvilken inntekt du har i tillegg.',
  'beregning.avansert.rediger.uttaksgrad.validation_error':
    'Du må velge hvor mye alderspensjon du vil ta ut.',
  'beregning.avansert.rediger.uttaksgrad.ufoeretrygd.validation_error':
    'Du må sette ned uttaksgraden slik at gradene av alderspensjon og uføretrygd ikke overstiger 100 % til sammen. Etter {normertPensjonsalder} kan du velge 100 % uttak.',
  'beregning.avansert.rediger.inntekt_vsa_helt_uttak.beloep.validation_error':
    'Du må fylle ut forventet årsinntekt samtidig som du tar ut <nowrap>100 %</nowrap> pensjon.',
  'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak':
    'Forventer du å ha inntekt samtidig som du tar ut <nowrap>{grad} %</nowrap> pensjon?',
  'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.description':
    'Du kan tjene så mye du vil samtidig som du tar ut pensjon.',
  'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.ufoeretrygd.description':
    'Alderspensjonen påvirker ikke inntektsgrensen for uføretrygden din.',
  'beregning.avansert.rediger.radio.afp_inntekt_maaned_foer_uttak.validation_error':
    'Du må svare på om du forventer å ha inntekt på minst {grunnbeloep} før skatt den siste måneden før du tar ut AFP.',
  'beregning.avansert.rediger.radio.inntekt_vsa_afp.validation_error':
    'Du må svare på om du forventer å ha inntekt samtidig som du tar ut AFP.',
  'beregning.avansert.rediger.inntekt_vsa_afp.validation_error':
    'Du må fylle ut forventet årsinntekt samtidig som du tar ut AFP.',
  'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.description.validation_error':
    'Du må svare på om du forventer å ha inntekt samtidig som du tar ut <nowrap>{grad} %</nowrap> pensjon.',
  'beregning.avansert.rediger.inntekt_vsa_gradert_uttak.beloep.validation_error':
    'Du må fylle ut forventet årsinntekt samtidig som du tar ut <nowrap>{grad} %</nowrap> pensjon.',
  'beregning.avansert.rediger.inntekt_vsa_gradert_uttak.label':
    'Hva er din forventede årsinntekt samtidig som du tar ut <nowrap>{grad} %</nowrap> alderspensjon?',
  'beregning.avansert.rediger.inntekt_vsa_gradert_uttak.description':
    'Dagens kroneverdi før skatt',
  'beregning.avansert.rediger.inntekt.button': 'Endre inntekt',
  'beregning.avansert.rediger.agepicker.validation_error':
    ' for når du vil ta ut alderspensjon.',
  'beregning.avansert.rediger.agepicker.afp.validation_error':
    ' for når du vil ta ut AFP.',
  'beregning.avansert.rediger.agepicker.grad.validation_error':
    ' for når du vil ta ut <nowrap>{grad} %</nowrap> alderspensjon.',
  'beregning.avansert.rediger.agepicker.validation_error.maxAlder':
    'Uttaksalder for <nowrap>100 %</nowrap> alderspensjon må være senere enn alder for gradert pensjon.',
  'beregning.avansert.rediger.heltuttak.agepicker.label':
    'Når vil du ta ut <nowrap>100 %</nowrap> alderspensjon?',
  'beregning.avansert.rediger.beregningsvalg.description':
    'Du har <nowrap>{ufoeregrad} %</nowrap> uføretrygd. Før du blir <nowrap>62 år</nowrap> må du velge enten uføretrygd eller AFP.{br}',
  'beregning.avansert.rediger.beregningsvalg.om_valget_link':
    'Om valget mellom uføretrygd og AFP',
  'beregning.avansert.rediger.radio.beregningsvalg.label':
    'Hva vil du beregne?',
  'beregning.avansert.rediger.radio.beregningsvalg.uten_afp.label':
    'Alderspensjon og uføretrygd, uten AFP.',
  'beregning.avansert.rediger.radio.beregningsvalg.med_afp.label':
    'Alderspensjon og AFP, uten uføretrygd fra <nowrap>{nedreAldersgrense}</nowrap>',
  'beregning.avansert.rediger.afp_etterfulgt_av_ap.title':
    'Beregn AFP (avtalefestet pensjon)',
  'beregning.avansert.rediger.beregningsvalg.med_afp.title':
    'Alderspensjon og AFP fra <nowrap>{nedreAldersgrense}</nowrap>',
  'beregning.avansert.rediger.beregningsvalg.med_afp.description':
    '<nowrap>{nedreAldersgrense}</nowrap> er laveste uttaksalder. Du må ha høy nok pensjonsopptjening for å kunne ta ut alderspensjon og AFP fra denne alderen.',
  'beregning.avansert.button.beregn': 'Beregn pensjon',
  'beregning.avansert.button.beregn.endring': 'Beregn ny pensjon',
  'beregning.avansert.button.oppdater': 'Oppdater pensjon',
  'beregning.avansert.button.nullstill': 'Nullstill valg',
  'beregning.avansert.button.avbryt': 'Avbryt endring',
  'beregning.vilkaarsproeving.intro':
    'Opptjeningen din er ikke høy nok til ønsket uttak. ',
  'beregning.vilkaarsproeving.intro.ikke_nok_opptjening':
    '{br}{br}Du kan tidligst ta ut alderspensjon ved {normertPensjonsalder}.',
  'beregning.vilkaarsproeving.intro.optional':
    'Du må øke alderen eller sette ned uttaksgraden.{br}{br}',
  'beregning.vilkaarsproeving.alternativer.heltUttak':
    'Et alternativ er at du ved {alternativtHeltStartAar} år og {alternativtHeltStartMaaned} måneder kan ta ut <nowrap>100 %</nowrap> alderspensjon. Prøv gjerne andre kombinasjoner.',
  'beregning.vilkaarsproeving.alternativer.gradertUttak':
    'Et alternativ er at du ved {alternativtGradertStartAar} år og {alternativtGradertStartMaaned} måneder kan ta ut <nowrap>{alternativtGrad} %</nowrap> alderspensjon. Prøv gjerne andre kombinasjoner.',
  'beregning.vilkaarsproeving.alternativer.heltOgGradertUttak':
    'Et alternativ er at du ved {alternativtGradertStartAar} år og {alternativtGradertStartMaaned} måneder kan ta ut <nowrap>{alternativtGrad} %</nowrap> alderspensjon hvis du tar ut <nowrap>100 %</nowrap> alderspensjon ved {alternativtHeltStartAar} år og {alternativtHeltStartMaaned} måneder eller senere. Prøv gjerne andre kombinasjoner.',
  'beregning.vilkaarsproeving.medAFP.intro':
    'Opptjeningen din er ikke høy nok til ønsket uttak. Du må endre valgene dine.',
  'beregning.vilkaarsproeving.alternativer.medAFP.gradertUttak':
    '{br}{br}Et alternativ er at du ved {nedreAldersgrense} kan ta ut <nowrap>{alternativtGrad} %</nowrap> alderspensjon. Prøv gjerne andre kombinasjoner.',
  'beregning.vilkaarsproeving.alternativer.medAFP.heltOgGradertUttak':
    '{br}{br}Et alternativ er at du ved {nedreAldersgrense} kan ta ut <nowrap>{alternativtGrad} %</nowrap> alderspensjon hvis du tar ut <nowrap>100 %</nowrap> alderspensjon ved {alternativtHeltStartAar} år og {alternativtHeltStartMaaned} måneder eller senere. Prøv gjerne andre kombinasjoner.',
  'beregning.vilkaarsproeving.alternativer.medAFP.heltOgGradertUttak100':
    '{br}{br}Et alternativ er at du ved {nedreAldersgrense} kan ta ut <nowrap>{alternativtGrad} %</nowrap> alderspensjon. Prøv gjerne andre kombinasjoner.',
  'beregning.vilkaarsproeving.alternativer.medAFP.ikkeNokOpptjening':
    'Opptjeningen din er ikke høy nok til uttak av alderspensjon ved {nedreAldersgrense}.{br}{br}Kalkulatoren kan ikke beregne uttak etter {nedreAldersgrense}. Hvis du tar ut alderspensjon og AFP senere enn dette, vil du i perioden fra du er 62 år frem til uttak ikke få uføretrygd. Kontakt Nav for veiledning hvis du vurderer å si fra deg uføretrygden.{br}{br}Har du rett til livsvarig AFP i offentlig sektor kan du ta ut AFP før alderspensjon. Kontakt tjenestepensjonsordningen din for veiledning.',
  'grunnlag.title': 'Om inntekten og pensjonen din',
  'grunnlag.endring.title': 'Om pensjonen din',
  'maanedsbeloep.title': 'Månedlig pensjon',
  'beregning.avansert.avbryt_modal.title':
    'Hvis du går ut av Avansert, mister du alle valgene dine.',
  'beregning.avansert.avbryt_modal.endring.title':
    'Hvis du går ut av beregningen, mister du alle valgene dine og går tilbake til start.',
  'beregning.avansert.avbryt_modal.button.avslutt': 'Gå ut av Avansert',
  'beregning.avansert.avbryt_modal.endring.button.avslutt':
    'Gå ut av beregning',
  'beregning.avansert.avbryt_modal.button.avbryt': 'Avbryt',
  'beregning.avansert.alert.vilkaarsproevning.afp_inntekt_maaned_foer_uttak':
    'Med opplysninger vi har om deg, oppfyller du ikke vilkårene for AFP. {vilkaarForUttakAvAfp}. Du kan også beregne {alderspensjonUtenAFP}.',
  'beregning.avansert.alert.afp_inntekt_maaned_foer_uttak':
    'Du kan bare beregne AFP hvis du har en inntekt {grunnbeloepstekst}. Beregn i stedet {alderspensjonUtenAFP}.',
  'beregning.avansert.alert.afp_inntekt_maaned_foer_uttak.link.text':
    'alderspensjon uten AFP',
  'beregning.endring.alert.uttaksdato':
    'Du kan tidligst endre uttaksgrad til 20, 40, 50, 60 eller 80 % fra {dato}.',
  'beregning.endring.rediger.title': 'Beregn endring av alderspensjon',
  'beregning.endring.rediger.vedtak_status':
    'Fra {dato} har du mottatt {grad} % alderspensjon.',
  'beregning.endring.rediger.vedtak_grad_status':
    'Du har i dag <strong><nowrap>{grad} %</nowrap> alderspensjon</strong>. ',
  'beregning.endring.rediger.vedtak_betaling_status':
    'I {maaned} var dette <strong><nowrap>{beloep} kr</nowrap></strong> før skatt.',
  'grunnlag.uttaksgrad.title': 'Uttaksgrad',
  'grunnlag.uttaksgrad.avansert_link': 'Gå til avansert kalkulator',
  'grunnlag.uttaksgrad.ingress':
    'Denne beregningen viser <nowrap>100 %</nowrap> uttak av alderspensjon. I avansert kalkulator kan du beregne alderspensjon med andre uttaksgrader (<nowrap>20 %</nowrap>, <nowrap>40 %</nowrap>, <nowrap>50 %</nowrap>, <nowrap>60 %</nowrap> og <nowrap>80 %</nowrap>). Du kan jobbe så mye du vil ved siden av pensjon selv om du har tatt ut <nowrap>100 %</nowrap>.',
  'grunnlag.inntekt.title': 'Inntekt frem til uttak',
  'grunnlag.inntekt.avansert_kalkulator':
    'Du kan legge til inntekt ved siden av pensjon i ',
  'grunnlag.inntekt.avansert_link': 'avansert kalkulator',
  'grunnlag.inntekt.ingress':
    'Din siste pensjonsgivende inntekt fra Skatteetaten er <nowrap>{beloep} kr</nowrap> fra {aar}. Se tidligere inntekter i <dinPensjonBeholdningLink>Din pensjonsopptjening</dinPensjonBeholdningLink>. Du kan legge til inntekt ved siden av pensjon i ',
  'grunnlag.inntekt.ingress.endring':
    'Din siste pensjonsgivende inntekt fra Skatteetaten er <nowrap>{beloep} kr</nowrap> fra {aar}. Se tidligere inntekter i <dinPensjonBeholdningLink>Din pensjonsopptjening</dinPensjonBeholdningLink>.',
  'grunnlag.inntekt.info_om_inntekt': 'Hva er pensjonsgivende inntekt?',
  'grunnlag.inntekt.info_om_inntekt.lukk': 'Lukk',
  'grunnlag.sivilstand.title': 'Sivilstand',
  'grunnlag.sivilstand.title.error': 'Kunne ikke hentes',
  'grunnlag.sivilstand.ingress':
    'Hvis du bor sammen med noen kan inntekten til den du bor med ha betydning for hva du får i alderspensjon.{br}{br}Når du mottar alderspensjon må du derfor melde fra til Nav ved endring i sivilstand.{br}{br}<garantiPensjonLink>Om garantipensjon og satser</garantiPensjonLink>',
  'grunnlag.opphold.title.mindre_enn_5_aar': 'Opphold utenfor Norge',
  'grunnlag.opphold.title.mer_enn_5_aar': 'Opphold utenfor Norge',
  'grunnlag.opphold.title.for_lite_trygdetid': 'Opphold i Norge',
  'grunnlag.opphold.title.endring': 'Opphold utenfor Norge',
  'grunnlag.opphold.value.mindre_enn_5_aar': '5 år eller mindre',
  'grunnlag.opphold.value.mer_enn_5_aar': 'Mer enn 5 år',
  'grunnlag.opphold.value.for_lite_trygdetid': 'Mindre enn 5 år',
  'grunnlag.opphold.value.endring': 'Fra vedtak',
  'grunnlag.opphold.ingress.endre_opphold':
    'Du kan endre oppholdene dine ved å gå tilbake til {link}.',
  'grunnlag.opphold.ingress.endre_opphold.link': 'Opphold utenfor Norge',
  'grunnlag.opphold.ingress.mindre_enn_5_aar':
    'Beregningen forutsetter at du ikke har bodd eller jobbet utenfor Norge i mer enn 5 år fra fylte 16 år frem til du tar ut pensjon.',
  'grunnlag.opphold.ingress.for_lite_trygdetid':
    'Du har bodd mindre enn 5 år i Norge. Beregningen din kan være mangelfull.',
  'grunnlag.opphold.ingress.endring':
    'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.',
  'grunnlag.opphold.ingress.trygdetid':
    '<kortBotidLink>Om trygdetid</kortBotidLink>',
  'grunnlag.opphold.bunntekst':
    'Når du søker om alderspensjon vil opplysninger om opphold utenfor Norge sjekkes mot pensjonsmyndigheter i avtaleland. Den endelige pensjonen din kan derfor bli annerledes.',
  'grunnlag.opphold.avbryt_modal.title':
    'Hvis du går tilbake for å endre oppholdene dine, mister du alle valgene dine i beregningen.',
  'grunnlag.opphold.avbryt_modal.bekreft': 'Gå tilbake til opphold',
  'grunnlag.opphold.avbryt_modal.avbryt': 'Avbryt',
  'grunnlag.alderspensjon.title': 'Alderspensjon',
  'grunnlag.alderspensjon.value': 'Folketrygden (Nav)',
  'grunnlag.alderspensjon.ingress':
    'Alderspensjon beregnes ut ifra din opptjening i folketrygden. Hvis du fortsetter å ha inntekt samtidig som du tar ut pensjon, vil alderspensjonen din øke. Enkel beregning viser 100 % uttak av alderspensjon. I {avansert} kan du beregne alderspensjon med andre uttaksgrader.',
  'grunnlag.alderspensjon.endring.ingress':
    'Alderspensjon beregnes ut ifra din opptjening i folketrygden. Hvis du fortsetter å ha inntekt samtidig som du tar ut pensjon, vil alderspensjonen din øke.',
  'grunnlag.alderspensjon.endring.ingress.pensjonsbeholdning':
    '{br}{br}Din pensjonsopptjening før uttak: {sum} kr',
  'grunnlag.alderspensjon.ingress.link':
    '<dinPensjonBeholdningLink>Din pensjonsopptjening</dinPensjonBeholdningLink> <span><alderspensjonsreglerLink>Om reglene for alderspensjon</alderspensjonsreglerLink></span>',
  'grunnlag.afp.title': 'AFP',
  'grunnlag.afp.ikke_beregnet': 'ikke beregnet',
  'grunnlag.afp.endring': 'uendret',
  'grunnlag.afp.ingress.null': '-',
  'grunnlag.afp.ingress.ja_offentlig':
    'Du har oppgitt AFP i offentlig sektor. For å ha rett til AFP må du oppfylle vilkår både hos Nav og tjenestepensjonsordningen din. Beregningen forutsetter at vilkårene er oppfylt. For mer informasjon, kontakt tjenestepensjonsordningen din.',
  'grunnlag.afp.ingress.overgangskull':
    'Beregningen av alderspensjon tar høyde for at du mottar AFP. AFP vises ikke i beregningen.',
  'grunnlag.afp.ingress.overgangskull.ufoeretrygd_eller_ap':
    'Når du mottar uføretrygd eller alderspensjon kan du ikke beregne AFP i kalkulatoren.{br}{br} Hvis du vil beregne AFP i offentlig sektor og er under 65 år, kan du kontakte Nav på telefon 55 55 33 34. Er du over 65 år kan du kontakte tjenestepensjonsordningen din.{br}{br} AFP i privat sektor kan ikke kombineres med uføretrygd. Får du utbetalt uføretrygd etter du fyller 62 år mister du retten til AFP.{br}{br} Vil du vite mer? Les mer om <ufoeretrygdOgAfpLink>Uføretrygd og AFP</ufoeretrygdOgAfpLink>.',
  'grunnlag.afp.ingress.ja_offentlig.endring':
    'Du har AFP i offentlig sektor. Din AFP er ikke påvirket av endringen din av alderspensjon. Den fortsetter som før.',
  'grunnlag.afp.ingress.ja_offentlig.ufoeretrygd':
    'AFP og uføretrygd kan ikke kombineres, og får du utbetalt uføretrygd etter at du fyller 62 år mister du retten til AFP. Du må derfor velge mellom AFP og uføretrygd før du er 62 år.{br}{br} Vil du beregne hva du kan få i AFP, hvis du sier fra deg uføretrygden din? Da må du velge ‘Alderspensjon og AFP’ i <goToAvansert>Avansert</goToAvansert> beregning.',
  'grunnlag.afp.ingress.ja_offentlig_utilgjengelig':
    'Du har oppgitt AFP i offentlig sektor, men du har ikke samtykket til at Nav beregner den. Derfor vises ikke AFP i beregningen. Du kan endre valgene dine for AFP ved å gå tilbake til <goToAFP>AFP (avtalefestet pensjon)</goToAFP>.',
  'grunnlag.afp.ingress.ja_privat':
    'Du har oppgitt AFP i privat sektor. Nav har ikke vurdert om du fyller vilkårene for AFP, men forutsetter at du gjør det. Les mer om vilkårene for AFP og hvordan du søker hos <afpLink>Fellesordningen for AFP</afpLink>. Ved uttak av AFP, kan beløpet inkludere et kronetillegg på 1600 kr per måned frem til og med måneden du fyller 67 år.',
  'grunnlag.afp.ingress.ja_privat.endring':
    'Du har AFP i privat sektor. Din AFP er ikke påvirket av endringen din av alderspensjon. Den fortsetter som før.',
  'grunnlag.afp.ingress.ja_privat.ufoeretrygd':
    'AFP og uføretrygd kan ikke kombineres, og får du utbetalt uføretrygd etter at du fyller 62 år mister du retten til AFP. Du må derfor velge mellom AFP og uføretrygd før du er 62 år.{br}{br} Vil du beregne hva du kan få i AFP, hvis du sier fra deg uføretrygden din? Da må du velge ‘Alderspensjon og AFP’ i <goToAvansert>Avansert</goToAvansert> beregning.',
  'grunnlag.afp.ingress.vet_ikke':
    'Hvis du er usikker på om du har AFP bør du spørre arbeidsgiveren din. AFP kan påvirke når du kan ta ut alderspensjon. Du kan endre valgene dine for AFP ved å gå tilbake til <goToAFP>AFP (avtalefestet pensjon)</goToAFP>.',
  'grunnlag.afp.ingress.vet_ikke.ufoeretrygd':
    'Hvis du er usikker på om du har AFP bør du spørre arbeidsgiveren din. AFP og uføretrygd kan ikke kombineres, og får du utbetalt uføretrygd etter fylte 62 år mister du retten til AFP. Du må derfor undersøke om du har rett til AFP, og velge mellom AFP og uføretrygd før du er 62 år.',
  'grunnlag.afp.ingress.nei':
    'Du har svart at du ikke har rett til AFP. Derfor vises ikke AFP i beregningen. Du kan endre valgene dine for AFP ved å gå tilbake til <goToAFP>AFP (avtalefestet pensjon)</goToAFP>.',
  'grunnlag.afp.ingress.ufoeretrygd':
    'For å ha rett til AFP, må du være ansatt i offentlig sektor eller i en bedrift med AFP-ordning i privat sektor. Det gjelder de siste årene og helt fram til du tar ut AFP. Hvis du mottar full uføretrygd, har du derfor normalt ikke rett til AFP.{br}{br}Du kan ikke kombinere AFP og uføretrygd. Får du utbetalt uføretrygd etter du fyller 62 år mister du retten til AFP.{br}{br}Vil du vite mer? Les mer om <ufoeretrygdOgAfpLink>Uføretrygd og AFP</ufoeretrygdOgAfpLink>.',
  'grunnlag.afp.70prosentregel':
    'Din AFP er redusert fordi den oversteg 70 % av din tidligere inntekt.',
  'grunnlag.afp.avkortet.til.70.prosent':
    'Din AFP er avkortet til 70 prosent av tidligere arbeidsinntekt.',
  'grunnlag.afp.link.text': 'Om inntekt og AFP på nav.no',
  'grunnlag.forbehold.ingress_1':
    'Pensjonen er beregnet med opplysningene vi har om deg og opplysningene du har oppgitt. Beregningen er gjort med gjeldende regelverk. Dette er et foreløpig estimat på hva du kan forvente deg i pensjon. Nav er ikke ansvarlig for beløpene som er hentet inn fra andre. ',
  'grunnlag.forbehold.ingress_2':
    'Det kan skje endringer i regelverket og i opptjeningen din. Vi anbefaler at du gjør en ny beregning når du nærmer deg ønsket pensjonsalder.',
  'grunnlag.forbehold.link': 'Alle forbehold',
  'grunnlag.forbehold.title': 'Forbehold',
  'om_deg.title': 'Om deg',
  'grunnlag2.endre_inntekt.title': 'Pensjonsgivende inntekt frem til uttak',
  'savnerdunoe.title': 'Savner du noe?',
  'savnerdunoe.title.endring': 'Klar til å søke om endring?',
  'savnerdunoe.ingress':
    'Flere valg for uttaksgrad, pensjonsalder og inntekt finner du i Avansert.',
  'savnerdunoe.ingress.endring':
    'Send søknad om endring av alderspensjon i Din pensjon (åpner i en ny fane)',
  'pensjonsavtaler.fra_og_med_forklaring':
    '«Fra» betyr «fra og med». «Til» betyr «til og med».',
  'pensjonsavtaler.private.title.ingen': 'Private pensjonsavtaler',
  'pensjonsavtaler.private.ingress.norsk_pensjon':
    'Avtaler fra privat sektor hentes fra <norskPensjonLink>Norsk Pensjon</norskPensjonLink>. Du kan ha andre avtaler enn det som finnes i Norsk Pensjon. Kontakt aktuell pensjonsordning.',
  'pensjonsavtaler.private.ingress.error.pensjonsavtaler':
    'Vi klarte ikke å hente dine private pensjonsavtaler. Prøv igjen senere.',
  'pensjonsavtaler.private.ingress.error.pensjonsavtaler.partial':
    'Vi klarte ikke å hente alle dine private pensjonsavtaler. Prøv igjen senere.',
  'pensjonsavtaler.ingress.error.samtykke_ingress':
    'Du har ikke samtykket til å hente inn pensjonsavtaler. ',
  'pensjonsavtaler.ingress.error.samtykke_link_1': 'Start en ny beregning',
  'pensjonsavtaler.ingress.error.samtykke_link_2':
    'hvis du ønsker å få dette i beregningen.',
  'pensjonsavtaler.ingress.ingen': 'Vi fant ingen pensjonsavtaler.',
  'pensjonsavtaler.kr_pr_aar': 'kr per år',
  'pensjonsavtaler_mobil.kr_pr_aar': 'kr/år',
  'alder.livsvarig': 'Livsvarig fra',
  'pensjonsavtaler.md': 'md.',
  'pensjonsavtaler.tabell.title.left': 'Avtaler',
  'pensjonsavtaler.tabell.title.middle': 'Perioder',
  'pensjonsavtaler.tabell.title.right': 'Årlig beløp',
  'pensjonsavtaler.til': 'til',
  'pensjonsavtaler.title': 'Pensjonsavtaler',
  'pensjonsavtaler.offentligtp.title': 'Offentlig tjenestepensjon',
  'pensjonsavtaler.offentligtp.er_medlem_annen_ordning':
    'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning ({chunk}).',
  'pensjonsavtaler.offentligtp.error':
    'Vi klarte ikke å sjekke om du har offentlige pensjonsavtaler. Har du vært eller er ansatt i offentlig sektor, kan du sjekke tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).',
  'pensjonsavtaler.offentligtp.teknisk_feil':
    'Vi klarte ikke å hente din offentlige tjenestepensjon. Prøv igjen senere eller kontakt tjenestepensjonsordningen din ({chunk}).',
  'pensjonsavtaler.offentligtp.empty':
    'Vi fikk ikke svar fra din offentlige tjenestepensjonsordning.',
  'pensjonsavtaler.offentligtp.subtitle.spk':
    'Alderspensjon fra Statens pensjonskasse (SPK)',
  'pensjonsavtaler.offentligtp.subtitle.klp':
    'Alderspensjon fra Kommunal Landspensjonskasse (KLP)',
  'pensjonsavtaler.offentligtp.spk.afp_ja':
    'Livsvarig AFP er ikke inkludert i dette beløpet. Sjekk <spkLink>SPK</spkLink> for detaljer om pensjonsavtalen din.',
  'pensjonsavtaler.offentligtp.spk.afp_nei.med_betinget':
    'Du har oppgitt at du ikke har rett til livsvarig AFP. Betinget tjenestepensjon er derfor inkludert i beløpet. Sjekk <spkLink>SPK</spkLink> for detaljer.',
  'pensjonsavtaler.offentligtp.spk.afp_nei.uten_betinget':
    'Du har oppgitt at du ikke har rett til livsvarig AFP. Sjekk <spkLink>SPK</spkLink> for detaljer.',
  'pensjonsavtaler.offentligtp.spk.afp_vet_ikke':
    'Du har oppgitt at du ikke vet om du har rett til livsvarig AFP. Beløpet kan derfor inkludere betinget tjenestepensjon. Sjekk <spkLink>SPK</spkLink> for detaljer.',
  'pensjonsavtaler.offentligtp.klp.afp_ja':
    'Livsvarig AFP eller eventuell betinget tjenestepensjon er ikke inkludert i dette beløpet. Sjekk <klpLink>KLP</klpLink> for detaljer om pensjonsavtalen din.',
  'pensjonsavtaler.offentligtp.klp.afp_nei+vetikke':
    'Du har ikke oppgitt at du har rett til livsvarig AFP. Eventuell livsvarig AFP eller betinget tjenestepensjon er ikke inkludert i dette beløpet. Sjekk <klpLink>KLP</klpLink> for detaljer om pensjonsavtalen din.',
  'inntekt.endre_inntekt_modal.open.button': 'Endre inntekt',
  'inntekt.endre_inntekt_modal.title': 'Pensjonsgivende inntekt',
  'inntekt.endre_inntekt_modal.textfield.label':
    'Hva er din forventede årsinntekt frem til du tar ut pensjon?',
  'inntekt.endre_inntekt_modal.textfield.description':
    'Dagens kroneverdi før skatt',
  'inntekt.endre_inntekt_modal.textfield.description.ufoere':
    'Uføretrygd og uførepensjon skal ikke være med. Dagens kroneverdi før skatt.',
  'inntekt.endre_inntekt_modal.paragraph':
    'Når du oppdaterer inntekten, må du velge alder på nytt.',
  'inntekt.endre_inntekt_modal.textfield.validation_error.required':
    'Du må fylle ut inntekt.',
  'inntekt.endre_inntekt_modal.textfield.validation_error.type':
    'Du må skrive hele tall for å oppgi inntekt.',
  'inntekt.endre_inntekt_modal.textfield.validation_error.max':
    'Inntekten kan ikke overskride 100 000 000 kroner.',
  'inntekt.endre_inntekt_modal.button': 'Oppdater inntekt',
  'inntekt.endre_inntekt_vsa_pensjon_modal.label':
    'Forventet årsinntekt mens du tar ut <nowrap>100 %</nowrap> alderspensjon',
  'inntekt.endre_inntekt_vsa_pensjon_modal.ingress_2':
    'Du kan tjene så mye du vil samtidig som du tar ut <nowrap>100 %</nowrap> alderspensjon.',
  'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.legg_til':
    'Legg til inntekt',
  'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.endre': 'Endre inntekt',
  'inntekt.endre_inntekt_vsa_pensjon_modal.button.slette': 'Slett inntekt',
  'inntekt.endre_inntekt_vsa_pensjon_modal.title': 'Pensjonsgivende inntekt',
  'inntekt.endre_inntekt_vsa_pensjon_modal.textfield.label':
    'Hva er din forventede årsinntekt samtidig som du tar ut <nowrap>100 %</nowrap> alderspensjon?',
  'inntekt.endre_inntekt_vsa_afp_modal.textfield.label':
    'Hva er din forventede årsinntekt samtidig som du tar ut AFP?',
  'inntekt.endre_inntekt_vsa_pensjon_modal.textfield.description':
    'Dagens kroneverdi før skatt',
  'inntekt.endre_inntekt_vsa_pensjon_modal.agepicker.label':
    'Til hvilken alder forventer du å ha inntekten?',
  'inntekt.endre_inntekt_vsa_pensjon_modal.button.legg_til': 'Legg til inntekt',
  'inntekt.endre_inntekt_vsa_pensjon_modal.button.endre': 'Oppdater inntekt',
  'inntekt.info_om_inntekt.open.link': 'Hva er pensjonsgivende inntekt?',
  'inntekt.info_om_inntekt.intro':
    'Vi bruker siste tilgjengelige årsinntekt fra Skatteetaten som fremtidig inntekt. Hvis du endrer den i kalkulatoren, bruker vi den i stedet.{br}{br}',
  'inntekt.info_om_inntekt.subtitle_1': 'Dette er pensjonsgivende inntekt:',
  'inntekt.info_om_inntekt.list_item1': 'all lønnsinntekt for lønnstakere',
  'inntekt.info_om_inntekt.list_item2':
    'personinntekt fra næring for selvstendige',
  'inntekt.info_om_inntekt.list_item3': 'foreldrepenger',
  'inntekt.info_om_inntekt.list_item4': 'sykepenger',
  'inntekt.info_om_inntekt.list_item5': 'dagpenger',
  'inntekt.info_om_inntekt.list_item6': 'arbeidsavklaringspenger',
  'inntekt.info_om_inntekt.list_item7': 'omstillingsstønad',
  'inntekt.info_om_inntekt.list_item8': 'omsorgsstønad',
  'inntekt.info_om_inntekt.list_item9':
    'fosterhjemsgodtgjørelse (den delen som utgjør arbeidsgodtgjørelse)',
  'inntekt.info_om_inntekt.subtitle_2':
    'Dette er ikke pensjonsgivende inntekt:',
  'inntekt.info_om_inntekt.ikke_inntekt.list_item1':
    'uføretrygd fra Nav gir opptjening til alderspensjon, men er ikke pensjonsgivende inntekt',
  'inntekt.info_om_inntekt.ikke_inntekt.list_item2':
    'uførepensjon og annen pensjon fra tjenestepensjonsordning',
  'inntekt.info_om_inntekt.ikke_inntekt.list_item3':
    'inntekt og pensjon fra utlandet',
  'inntekt.info_om_inntekt.ikke_inntekt.list_item4':
    'førstegangstjeneste (hvis påbegynt tidligst i 2010) gir opptjening til alderspensjon, men er ikke pensjonsgivende inntekt',
  'inntekt.info_om_inntekt.ingress':
    'Listen er ikke uttømmende.{br}{br}Pensjonsgivende inntekt har betydning for retten til og størrelsen på alderspensjon og andre pensjonsytelser.',
  'forbehold.title': 'Forbehold',
  'personopplysninger.header':
    'Personopplysninger som brukes i pensjonskalkulator',
  'personopplysninger.section.formaal.header':
    'Hva er formålet med personopplysningene?',
  'personopplysninger.section.formaal.1':
    'Nav henter inn personopplysninger i kalkulatoren for at du skal kunne planlegge pensjonen din, og få et estimat på fremtidig pensjon.',
  'personopplysninger.section.formaal.2':
    'Du må logge inn for å bruke kalkulatoren. For å beregne alderspensjon bruker vi opplysninger du oppgir i kalkulatoren, opplysninger Nav har om deg, og nødvendige opplysninger fra andre offentlige instanser. Hvis du samtykker, henter vi inn pensjonsavtaler fra andre pensjonsleverandører, for å gi deg en samlet oversikt over pensjonen din.',
  'personopplysninger.section.hvordan_brukes.header':
    'Hvordan behandler vi personopplysninger?',
  'personopplysninger.section.hvordan_brukes.1':
    'Nav henter inn og utleverer kun personopplysninger når vi har lovhjemmel til det. Hvis vi trenger flere opplysninger, ber vi om et samtykke fra deg til å innhente eller utlevere opplysningene. Vi bruker kun opplysningene til det du samtykker til. Samtykket er frivillig. Du får informasjon underveis om hvilke opplysninger vi henter inn fra andre, som f.eks. Folkeregisteret og pensjonsleverandører.',
  'personopplysninger.section.hvordan_brukes.2':
    'Vi lagrer ikke beregningene du gjør, eller personopplysningene brukt i behandlingen.',
  'personopplysninger.section.hvordan_brukes.3':
    'Behandlingsgrunnlaget for behandlingen simulering av pensjon er Art. 6 (1) c Rettslig forpliktelse, Forvaltningsloven § 11, Folketrygdlovens kapittel 20 Alderspensjon og Art 6 (1) a, Samtykke. Nav er behandlingsansvarlig for behandlingen som gjøres i pensjonskalkulatoren.',
  'personopplysninger.section.hvilke_opplysninger.header':
    'Hvilke personopplysninger bruker vi?',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.header':
    'Opplysninger som vi henter for å oppfylle Nav sin veiledningsplikt etter Art. 6 (1) c Rettslig forpliktelse, Forvaltningsloven § 11.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.1':
    'Fødselsnummeret ditt henter vi fra ID-porten for å identifisere deg.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.2':
    'Navnet ditt henter vi fra Folkeregisteret for å tydeliggjøre at beregningen gjelder deg.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.3':
    'Fødselsdatoen din henter vi fra Folkeregisteret for at vi skal kunne beregne alderspensjonen din.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.4':
    'Ønsket alder (år og ev. måned) for uttak av pensjon oppgir du for at vi skal kunne beregne alderspensjonen din.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.5':
    'Din pensjonsopptjening hentes fra pensjonsopptjeningsregisteret hos Nav, som er basert på innrapporterte inntekter fra Skatteetaten, og ev. opptjening fra dagpenger, førstegangstjeneste, omsorgsopptjening og opptjening fra uføretrygd.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.6':
    'Din siste pensjonsgivende årsinntekt (og årstall) fra Skatteetaten brukes som inntekt frem til uttak av pensjon. Den inngår i pensjonsbeholdningen for beregning av alderspensjonen din. Endrer du fremtidig inntekt, blir din fremtidige pensjonsbeholdning basert på den.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.7':
    'Din sivilstand kan påvirke pensjonens størrelse. Opplysninger om sivilstanden din hentes fra Folkeregisteret. Hvis du er registrert som ugift, separert, skilt eller enke/enkemann, spør vi deg om du har samboer. Endringer du gjør, gjelder kun for den beregningen og lagres ikke hos Nav eller Folkeregisteret.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.8':
    'Hvis du har uføretrygd, bruker vi din uførehistorikk, uføregrad, antatt inntekt og eventuell yrkesskadehistorikk. Dette gjør vi for å kunne beregne alderspensjonen din. Vi bruker også uføregraden til å vise mulige graderinger av alderspensjon som du kan ta ut i kombinasjon med uføretrygd. Vi henter ikke inn medisinske opplysninger fra saken din.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.9':
    'Hvis du har gjenlevendepensjon eller omstillingsstønad, bruker vi opplysningen til å informere deg om at gjenlevendepensjon og omstillingsstønad ikke kan kombineres med alderspensjon.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.10':
    'Vi spør deg om opphold utenfor Norge. Vi bruker opplysningen til å beregne alderspensjon med riktig trygdetid i Norge. Vi spør om hvilket land oppholdet gjelder og om arbeid i landet, for å legge riktig trygdeavtale til grunn.',
  'personopplysninger.section.hvilke_opplysninger.veiledningsplikt.list.11':
    'Vi spør deg om du har rett til AFP i enten offentlig eller privat sektor. Vi bruker opplysningen til å identifisere om vi skal beregne alderspensjonen din med AFP. Opplysningen brukes også til å informere om når du kan ta ut alderspensjon. Videre bruker vi opplysningen til å beregne AFP i privat sektor.',
  'personopplysninger.section.hvilke_opplysninger.gpdr.list.header':
    'Opplysninger som vi bruker hvis du samtykker (GDPR Art 6 (1) a, Samtykke).',
  'personopplysninger.section.hvilke_opplysninger.gpdr.list.1':
    'Fra Norsk Pensjon henter vi pensjonsavtaler fra privat sektor, som tjenestepensjon fra arbeidsgiver (innskudds-, ytelses- eller hybridpensjon), fripoliser og enkelte avtaler om pensjonssparing.',
  'personopplysninger.section.hvilke_opplysninger.gpdr.list.2':
    'Vi sjekker også om du er eller har vært medlem i en offentlig tjenestepensjonsordning. Hvis du er eller har vært medlem, informerer vi deg om at du kan ha rettigheter, men henter ikke inn avtalene.',
  'personopplysninger.section.hvilke_opplysninger.gpdr.list.3':
    'Vi beregner AFP i offentlig sektor ut i fra din AFP-beholdning, hvis du samtykker.',
  'personopplysninger.section.hvilke_opplysninger.gpdr.list.subtext':
    'Vi henter inn disse opplysningene for at du skal få oversikt over din samlede pensjon.',
  'personopplysninger.section.lagring.heading': 'Lagring',
  'personopplysninger.section.lagring.text':
    'Det er mellomlagring i pensjonskalkulatoren for å gjøre en beregning av pensjonen din. Når du avslutter beregningen eller logger ut, slettes mellomlagringen. Beregningen din blir ikke lagret eller arkivert hos Nav.',
  'personopplysninger.section.informasjon_om_rettighetene.heading':
    'Informasjon om rettighetene dine',
  'personopplysninger.section.informasjon_om_rettighetene.text':
    'Se <navPersonvernerklaeringLink>personvernerklæringen</navPersonvernerklaeringLink> for Nav.',
  'personopplysninger.section.spoersmaal.heading':
    'Spørsmål til Nav eller datatilsynet om personvern',
  'personopplysninger.section.spoersmaal.text':
    'Se kontaktinformasjon i <navPersonvernerklaeringKontaktOssLink>personvernerklæringen</navPersonvernerklaeringKontaktOssLink> for Nav.',
  'showmore.vis_mindre': 'Vis mindre',
  'showmore.vis_mer': 'Vis mer',
  'link.telefon_pensjon': '55 55 33 34',
}
export default translations
export type Translations = typeof translations
