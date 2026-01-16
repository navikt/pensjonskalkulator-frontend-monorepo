import { IntlShape } from 'react-intl'

import { getAlderspensjonHeading } from '@/components/Simulering/BeregningsdetaljerForOvergangskull/AlderspensjonDetaljerGrunnlag'
import {
  AfpDetaljerListe,
  AlderspensjonDetaljerListe,
} from '@/components/Simulering/BeregningsdetaljerForOvergangskull/hooks'
import { getAfpDetaljerTable, getAfpIngress } from '@/pdf-view/afp'
import { getPdfLink, pdfFormatMessageValues } from '@/pdf-view/utils'
import { formatInntekt } from '@/utils/inntekt'

import { getAlderspensjonDetaljerTable } from './alderspensjon'

const DIN_PENSJON_OPPTJENING_URL = 'https://nav.no/pensjon/opptjening'

export function getGrunnlagIngress({
  intl,
  alderspensjonDetaljerListe,
  aarligInntektFoerUttakBeloepFraSkatt,
  aarligInntektFoerUttakBeloepFraBrukerInput,
  afpDetaljerListe,
  title,
  content,
  hasPre2025OffentligAfpUttaksalder,
  uttaksalder,
  gradertUttaksperiode,
  shouldHideAfpHeading,
}: {
  intl: IntlShape
  alderspensjonDetaljerListe: AlderspensjonDetaljerListe[]
  afpDetaljerListe: AfpDetaljerListe[]
  aarligInntektFoerUttakBeloepFraSkatt?: {
    beloep: string
    aar: number
  }
  aarligInntektFoerUttakBeloepFraBrukerInput: string | null
  title?: string
  content?: string
  hasPre2025OffentligAfpUttaksalder: boolean
  uttaksalder: Alder | null
  gradertUttaksperiode: GradertUttak | null
  shouldHideAfpHeading: boolean
}): string {
  const beloepRaw = aarligInntektFoerUttakBeloepFraSkatt?.beloep
  const aarRaw = aarligInntektFoerUttakBeloepFraSkatt?.aar

  const beloepFormatted = beloepRaw
    ? formatInntekt(String(beloepRaw)).replace(/\u00A0/g, ' ')
    : ''
  const aarFormatted = aarRaw != null ? String(aarRaw) : ''

  const inntektBeloepOgÅr = intl.formatMessage(
    { id: 'grunnlag.inntekt.ingress' },
    {
      ...pdfFormatMessageValues,
      beloep: beloepFormatted,
      aar: aarFormatted,
      dinPensjonBeholdningLink: (chunks: string[]) =>
        getPdfLink({
          url: DIN_PENSJON_OPPTJENING_URL,
          displayText: chunks.join('') || 'Din pensjonsopptjening',
        }),
    }
  )
  return `<h2>${intl.formatMessage({ id: 'grunnlag.title' })}</h2>
  <h3>${intl.formatMessage(
    { id: 'grunnlag2.endre_inntekt.title' },
    {
      ...pdfFormatMessageValues,
      beloep: aarligInntektFoerUttakBeloepFraBrukerInput ?? beloepFormatted,
    }
  )}</h3>
  
  <p>${inntektBeloepOgÅr} avansert kalkulator.</p>
  
  <h3>Alderspensjon (Nav)</h3>
  <p>
    ${intl.formatMessage(
      { id: 'grunnlag.alderspensjon.ingress' },
      {
        avansert: '',
      }
    )}
  </p>
  
  ${alderspensjonDetaljerListe
    .map((alderspensjonVedUttaksValg, index) => {
      const apHeading = getAlderspensjonHeading({
        index,
        hasPre2025OffentligAfpUttaksalder,
        uttaksalder,
        gradertUttaksperiode,
      })
      const headingHtml = `<h4>${intl.formatMessage(
        {
          id: apHeading.messageId,
        },
        {
          alderAar: apHeading.age,
          alderMd: apHeading.months,
          grad: apHeading.grad,
        }
      )}
    </h4>`
      return `${headingHtml}${getAlderspensjonDetaljerTable(alderspensjonVedUttaksValg)}`
    })
    .join('')}

  <div>${getPdfLink({
    url: DIN_PENSJON_OPPTJENING_URL,
    displayText: 'Din pensjonsopptjening',
  })}</div>

  <div>${getPdfLink({
    url: 'https://nav.no/alderspensjon#beregning',
    displayText: 'Om reglene for alderspensjon ',
  })}
  </div>

  ${getAfpIngress(intl, title || '', content || '')}
  ${getAfpDetaljerTable({ afpDetaljerListe, intl, uttaksalder, gradertUttaksperiode, shouldHideAfpHeading })}
  `
}
