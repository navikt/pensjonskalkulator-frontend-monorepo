import { SanityReadmore } from '@/components/common/SanityReadmore'

interface Props {
  ufoeregrad: number
  isEndring: boolean
}

// PEK-1026 - Denne komponenten fases sannsynligvis ut etter at logikken med ufoeretrygd er splittet / Kanskje fint å beholde denne for å forenkle readmore logikk
export const ReadMoreOmPensjonsalder = ({ ufoeregrad, isEndring }: Props) => {
  let messageId = 'om_TMU'
  if (ufoeregrad) {
    messageId =
      ufoeregrad === 100
        ? 'om_pensjonsalder_UT_hel'
        : 'om_pensjonsalder_UT_gradert_avansert'
  } else if (isEndring) {
    messageId = 'om_TMU_endring'
  }

  return <SanityReadmore id={messageId} />
}
