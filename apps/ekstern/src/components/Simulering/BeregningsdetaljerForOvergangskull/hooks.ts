import { useMemo } from 'react'

import { useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { formatDecimalWithComma, formatInntekt } from '@/utils/inntekt'

export interface DetaljRad {
  tekst: string
  verdi?: number | string
}

export interface AlderspensjonDetaljerListe {
  alderspensjon: DetaljRad[]
  opptjeningKap19: DetaljRad[]
  opptjeningKap20: DetaljRad[]
}

export interface BeregningsdetaljerRader {
  alderspensjonDetaljerListe: AlderspensjonDetaljerListe[]
  pre2025OffentligAfpDetaljerListe: DetaljRad[]
  afpPrivatDetaljerListe: DetaljRad[][]
  afpOffentligDetaljerListe: DetaljRad[]
  opptjeningPre2025OffentligAfpListe: DetaljRad[]
}

function getAlderspenListeForValgtUttaksalder(
  uttaksalder: { aar: number; maaneder?: number } | null,
  gradertUttaksperiode: GradertUttak | null,
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
) {
  if (!alderspensjonListe || alderspensjonListe.length === 0 || !uttaksalder) {
    return []
  }
  const filtrertAldersPensjonListe = alderspensjonListe.filter((ap) => {
    const gradertUttak =
      gradertUttaksperiode &&
      ap.alder === gradertUttaksperiode.uttaksalder.aar &&
      gradertUttaksperiode.grad > 0
    if (
      gradertUttak &&
      gradertUttaksperiode.uttaksalder.aar !== uttaksalder.aar
    ) {
      return gradertUttak
    } else {
      // heluttak
      return ap.alder === uttaksalder.aar
    }
  })

  if (!filtrertAldersPensjonListe.length) {
    // Bruker født < 1963, velger AFPOffentlig i simulering med uttaksalder < 67, hente første element fra listen siden den tilhører 67 år
    filtrertAldersPensjonListe.push(alderspensjonListe[0])
  }
  return filtrertAldersPensjonListe
}

function getAlderspensjonDetaljerListe(
  alderspensjonListeForValgtUttaksalder: AlderspensjonPensjonsberegning[]
) {
  const alderspensjonDetaljerListe: AlderspensjonDetaljerListe[] = []

  const getAlderspensjonDetails = (
    ap: AlderspensjonPensjonsberegning,
    shouldShowParentheses: boolean
  ) => {
    const grunnpensjon =
      ap.grunnpensjon && ap.grunnpensjon > 0
        ? Math.round(ap.grunnpensjon / 12)
        : 0
    const tilleggspensjon =
      ap.tilleggspensjon && ap.tilleggspensjon > 0
        ? Math.round(ap.tilleggspensjon / 12)
        : 0
    const skjermingstillegg =
      ap.skjermingstillegg && ap.skjermingstillegg > 0
        ? Math.round(ap.skjermingstillegg / 12)
        : 0
    const pensjonstillegg =
      ap.pensjonstillegg && ap.pensjonstillegg > 0
        ? Math.round(ap.pensjonstillegg / 12)
        : 0
    const inntektspensjonBeloep =
      ap.inntektspensjonBeloep && ap.inntektspensjonBeloep > 0
        ? Math.round(ap.inntektspensjonBeloep / 12)
        : 0
    const garantipensjonBeloep =
      ap.garantipensjonBeloep && ap.garantipensjonBeloep > 0
        ? Math.round(ap.garantipensjonBeloep / 12)
        : 0

    const gjenlevendetillegg =
      ap.kapittel19Gjenlevendetillegg && ap.kapittel19Gjenlevendetillegg > 0
        ? Math.round(ap.kapittel19Gjenlevendetillegg / 12)
        : 0

    return [
      {
        tekst: shouldShowParentheses
          ? 'Grunnpensjon (kap. 19)'
          : 'Grunnpensjon',
        verdi: `${formatInntekt(grunnpensjon)} kr`,
      },
      {
        tekst: shouldShowParentheses
          ? 'Tilleggspensjon (kap. 19)'
          : 'Tilleggspensjon',
        verdi: `${formatInntekt(tilleggspensjon)} kr`,
      },
      {
        tekst: shouldShowParentheses
          ? 'Skjermingstillegg (kap. 19)'
          : 'Skjermingstillegg',
        verdi: `${formatInntekt(skjermingstillegg)} kr`,
      },
      {
        tekst: shouldShowParentheses
          ? 'Pensjonstillegg (kap. 19)'
          : 'Pensjonstillegg',
        verdi: `${formatInntekt(pensjonstillegg)} kr`,
      },
      {
        tekst: shouldShowParentheses
          ? 'Gjenlevendetillegg (kap. 19)'
          : 'Gjenlevendetillegg',
        verdi: `${formatInntekt(gjenlevendetillegg)} kr`,
      },
      {
        tekst: shouldShowParentheses
          ? 'Inntektspensjon (kap. 20)'
          : 'Inntektspensjon',
        verdi: `${formatInntekt(inntektspensjonBeloep)} kr`,
      },
      {
        tekst: shouldShowParentheses
          ? 'Garantipensjon (kap. 20)'
          : 'Garantipensjon',
        verdi: `${formatInntekt(garantipensjonBeloep)} kr`,
      },
      {
        tekst: 'Sum alderspensjon',
        verdi: `${formatInntekt(
          grunnpensjon +
            tilleggspensjon +
            skjermingstillegg +
            pensjonstillegg +
            inntektspensjonBeloep +
            garantipensjonBeloep +
            gjenlevendetillegg
        )} kr`,
      },
    ].filter((rad) => rad.verdi !== '0 kr')
  }

  const getOpptjeningKap19Details = (ap: AlderspensjonPensjonsberegning) => {
    if (ap.andelsbroekKap19 === 0) {
      return []
    }

    const sumPoengaar = (ap.poengaarFoer92 ?? 0) + (ap.poengaarEtter91 ?? 0)

    return [
      {
        tekst: 'Andelsbrøk',
        verdi: ap.andelsbroekKap19 ? `${ap.andelsbroekKap19 * 10}/10` : 0,
      },
      {
        tekst: 'Sluttpoengtall',
        verdi: ap.sluttpoengtall
          ? formatDecimalWithComma(ap.sluttpoengtall)
          : 0,
      },
      {
        tekst: 'Poengår',
        verdi: `${sumPoengaar} år`,
      },
      {
        tekst: 'Trygdetid',
        verdi: ap.trygdetidKap19 ? `${ap.trygdetidKap19} år` : '0 år',
      },
    ].filter(
      (rad) =>
        rad.tekst === 'Poengår' ||
        rad.tekst === 'Trygdetid' ||
        (rad.verdi !== 0 && rad.verdi !== '10/10')
    )
  }

  const getOpptjeningKap20Details = (ap: AlderspensjonPensjonsberegning) => {
    if (ap.andelsbroekKap20 === 0) {
      return []
    }

    return [
      {
        tekst: 'Andelsbrøk',
        verdi: ap.andelsbroekKap20 ? `${ap.andelsbroekKap20 * 10}/10` : 0,
      },
      {
        tekst: 'Trygdetid',
        verdi: ap.trygdetidKap20 ? `${ap.trygdetidKap20} år` : '0 år',
      },
      {
        tekst: 'Pensjonsbeholdning',
        verdi: `${formatInntekt(ap.pensjonBeholdningFoerUttakBeloep ?? 0)} kr`,
      },
    ].filter(
      (rad) =>
        rad.tekst === 'Trygdetid' ||
        rad.tekst === 'Pensjonsbeholdning' ||
        (rad.verdi !== 0 && rad.verdi !== '10/10')
    )
  }

  alderspensjonListeForValgtUttaksalder.forEach((ap) => {
    const opptjeningKap19 = getOpptjeningKap19Details(ap)
    const opptjeningKap20 = getOpptjeningKap20Details(ap)
    const hasKap19 = opptjeningKap19.length > 0
    const hasKap20 = opptjeningKap20.length > 0

    const obj = {
      alderspensjon: getAlderspensjonDetails(ap, hasKap19 && hasKap20),
      opptjeningKap19,
      opptjeningKap20,
    }
    alderspensjonDetaljerListe.push(obj)
  })

  return alderspensjonDetaljerListe
}

export function useBeregningsdetaljer(
  alderspensjonListe?: AlderspensjonPensjonsberegning[],
  afpPrivatListe?: AfpPrivatPensjonsberegning[],
  afpOffentligListe?: AfpPensjonsberegning[],
  pre2025OffentligAfp?: pre2025OffentligPensjonsberegning
): BeregningsdetaljerRader {
  const { uttaksalder, gradertUttaksperiode } = useAppSelector(
    selectCurrentSimulation
  )

  return useMemo(() => {
    const alderspensjonListeForValgtUttaksalder =
      getAlderspenListeForValgtUttaksalder(
        uttaksalder,
        gradertUttaksperiode,
        alderspensjonListe
      )
    const alderspensjonDetaljerListe = getAlderspensjonDetaljerListe(
      alderspensjonListeForValgtUttaksalder
    )
    const pre2025OffentligAfpDetaljerListe: DetaljRad[] = pre2025OffentligAfp
      ? (() => {
          const grunnpensjon =
            pre2025OffentligAfp.grunnpensjon &&
            pre2025OffentligAfp.grunnpensjon > 0
              ? Math.round(pre2025OffentligAfp.grunnpensjon)
              : 0
          const tilleggspensjon =
            pre2025OffentligAfp.tilleggspensjon &&
            pre2025OffentligAfp.tilleggspensjon > 0
              ? Math.round(pre2025OffentligAfp.tilleggspensjon)
              : 0
          const afpTillegg =
            pre2025OffentligAfp.afpTillegg && pre2025OffentligAfp.afpTillegg > 0
              ? Math.round(pre2025OffentligAfp.afpTillegg)
              : 0
          const saertillegg =
            pre2025OffentligAfp.saertillegg &&
            pre2025OffentligAfp.saertillegg > 0
              ? Math.round(pre2025OffentligAfp.saertillegg)
              : 0

          return [
            {
              tekst: 'Grunnpensjon (kap. 19)',
              verdi: `${formatInntekt(grunnpensjon)} kr`,
            },
            {
              tekst: 'Tilleggspensjon (kap. 19)',
              verdi: `${formatInntekt(tilleggspensjon)} kr`,
            },
            {
              tekst: 'AFP-tillegg',
              verdi: `${formatInntekt(afpTillegg)} kr`,
            },
            {
              tekst: 'Særtillegg',
              verdi: `${formatInntekt(saertillegg)} kr`,
            },
            {
              tekst: 'Sum AFP',
              verdi: `${formatInntekt(
                grunnpensjon + tilleggspensjon + afpTillegg + saertillegg
              )} kr`,
            },
          ].filter((rad) => rad.verdi !== '0 kr')
        })()
      : []

    const afpPrivatDetaljerListe: DetaljRad[][] = (() => {
      if (!afpPrivatListe || afpPrivatListe.length === 0) {
        return []
      }

      const afpIndices: number[] = []
      const currentAge =
        gradertUttaksperiode?.uttaksalder?.aar ?? uttaksalder!.aar

      // Find index for current age
      const currentAgeIndex = afpPrivatListe.findIndex(
        (afp) => afp.alder === currentAge
      )
      if (currentAgeIndex !== -1) {
        afpIndices.push(currentAgeIndex)
      } else {
        // If no exact age match, fallback to first element (usually the earliest available age)
        afpIndices.push(0)
      }

      // If current age is less than 67, also include age 67 data
      if (currentAge < 67) {
        const afp67Index = afpPrivatListe.findIndex((afp) => afp.alder === 67)
        if (afp67Index !== -1 && !afpIndices.includes(afp67Index)) {
          afpIndices.push(afp67Index)
        }
      }

      return afpIndices.map((index) => {
        const afp = afpPrivatListe[index]
        if (!afp) return []

        return [
          {
            tekst: 'Kompensasjonstillegg',
            verdi: afp.kompensasjonstillegg
              ? `${formatInntekt(afp.kompensasjonstillegg)} kr`
              : 0,
          },
          {
            tekst: 'Kronetillegg',
            verdi: afp.kronetillegg
              ? `${formatInntekt(afp.kronetillegg)} kr`
              : 0,
          },
          {
            tekst: 'Livsvarig del',
            verdi: afp.livsvarig ? `${formatInntekt(afp.livsvarig)} kr` : 0,
          },
          {
            tekst: 'Sum AFP',
            verdi: afp.maanedligBeloep
              ? `${formatInntekt(afp.maanedligBeloep)} kr`
              : 0,
          },
        ].filter((rad) => rad.verdi !== 0)
      })
    })()

    const afpOffentligDetaljerListe: DetaljRad[] = (() => {
      if (!afpOffentligListe || afpOffentligListe.length === 0) {
        return []
      }

      const afpAar = Math.min(
        uttaksalder?.aar ?? Infinity,
        gradertUttaksperiode?.uttaksalder.aar ?? Infinity
      )

      const afpOffentligVedUttak = afpOffentligListe.find(
        (it) => it.alder >= afpAar
      )

      if (!afpOffentligVedUttak) return []

      return [
        {
          tekst: 'Månedlig livsvarig avtalefestet pensjon (AFP)',
          verdi: `${formatInntekt(afpOffentligVedUttak?.maanedligBeloep ?? 0)} kr`,
        },
      ]
    })()

    const opptjeningPre2025OffentligAfpListe: DetaljRad[] = (() => {
      if (!pre2025OffentligAfp) {
        return []
      }
      const sumPoengaarPre2025OffentligAfp =
        (pre2025OffentligAfp.poengaarTom1991 ?? 0) +
        (pre2025OffentligAfp.poengaarFom1992 ?? 0)

      return [
        {
          tekst: 'AFP grad',
          verdi: pre2025OffentligAfp.afpGrad
            ? `${pre2025OffentligAfp.afpGrad} %`
            : 0,
        },
        {
          tekst: 'Sluttpoengtall',
          verdi: pre2025OffentligAfp.sluttpoengtall
            ? formatDecimalWithComma(pre2025OffentligAfp.sluttpoengtall)
            : 0,
        },
        {
          tekst: 'Poengår',
          verdi: `${sumPoengaarPre2025OffentligAfp} år`,
        },
        {
          tekst: 'Trygdetid',
          verdi: pre2025OffentligAfp.trygdetid
            ? `${pre2025OffentligAfp.trygdetid} år`
            : 0,
        },
      ].filter(
        (rad) =>
          rad.tekst === 'Poengår' ||
          rad.tekst === 'Trygdetid' ||
          rad.verdi !== 0
      )
    })()

    return {
      alderspensjonDetaljerListe,
      pre2025OffentligAfpDetaljerListe,
      afpPrivatDetaljerListe,
      afpOffentligDetaljerListe,
      opptjeningPre2025OffentligAfpListe,
    }
  }, [
    alderspensjonListe,
    afpPrivatListe,
    afpOffentligListe,
    pre2025OffentligAfp,
    uttaksalder,
    gradertUttaksperiode,
  ])
}
