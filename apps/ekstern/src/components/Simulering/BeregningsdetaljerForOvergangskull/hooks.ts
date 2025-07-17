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

  const getAlderspensjonDetails = (ap: AlderspensjonPensjonsberegning) => {
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
        tekst: 'Grunnpensjon (kap. 19)',
        verdi: `${formatInntekt(grunnpensjon)} kr`,
      },
      {
        tekst: 'Tilleggspensjon (kap. 19)',
        verdi: `${formatInntekt(tilleggspensjon)} kr`,
      },
      {
        tekst: 'Skjermingstillegg (kap. 19)',
        verdi: `${formatInntekt(skjermingstillegg)} kr`,
      },
      {
        tekst: 'Pensjonstillegg (kap. 19)',
        verdi: `${formatInntekt(pensjonstillegg)} kr`,
      },
      {
        tekst: 'Gjenlevendetillegg (kap. 19)',
        verdi: `${formatInntekt(gjenlevendetillegg)} kr`,
      },
      {
        tekst: 'Inntektspensjon (kap. 20)',
        verdi: `${formatInntekt(inntektspensjonBeloep)} kr`,
      },
      {
        tekst: 'Garantipensjon (kap. 20)',
        verdi: `${formatInntekt(garantipensjonBeloep)} kr`,
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
        )} kr`,
      },
    ].filter((rad) => rad.verdi !== '0 kr')
  }

  const getOpptjeningKap19Details = (ap: AlderspensjonPensjonsberegning) => {
    if (ap.andelsbroekKap19 === 0) {
      return []
    }
    return [
      {
        tekst: 'Andelsbrøk',
        verdi: ap.andelsbroekKap19 ? `${ap.andelsbroekKap19 * 10}/10` : 0,
      },
      {
        tekst: 'Sluttpoengtall',
        verdi: formatDecimalWithComma(ap.sluttpoengtall),
      },
      {
        tekst: 'Poengår',
        verdi: (ap.poengaarFoer92 ?? 0) + (ap.poengaarEtter91 ?? 0),
      },
      { tekst: 'Trygdetid', verdi: ap.trygdetidKap19 },
    ].filter(
      (rad) =>
        rad.verdi !== undefined &&
        (rad.tekst === 'Poengår' ||
          rad.tekst === 'Trygdetid' ||
          (rad.verdi !== 0 && rad.verdi !== '10/10'))
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
      { tekst: 'Trygdetid', verdi: ap.trygdetidKap20 },
      {
        tekst: 'Pensjonsbeholdning',
        verdi: `${formatInntekt(ap.pensjonBeholdningFoerUttakBeloep)} kr`,
      },
    ].filter(
      (rad) =>
        rad.verdi !== undefined &&
        (rad.tekst === 'Trygdetid' ||
          rad.tekst === 'Pensjonsbeholdning' ||
          (rad.verdi !== 0 && rad.verdi !== '10/10'))
    )
  }

  alderspensjonListeForValgtUttaksalder.forEach((ap) => {
    const obj = {
      alderspensjon: getAlderspensjonDetails(ap),
      opptjeningKap19: getOpptjeningKap19Details(ap),
      opptjeningKap20: getOpptjeningKap20Details(ap),
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
              tekst: 'Grunnpensjon (kap. 19)',
              verdi: `${formatInntekt(grunnpensjon)} kr`,
            },
            {
              tekst: 'Tilleggspensjon (kap. 19)',
              verdi: `${formatInntekt(tilleggspensjon)} kr`,
            },
            {
              tekst: 'AFP-tillegg',
              verdi: `${formatInntekt(afpTillegg)} kr`,
            },
            {
              tekst: 'Særtillegg',
              verdi: `${formatInntekt(saertillegg)} kr`,
            },
            {
              tekst: 'Sum AFP',
              verdi: `${formatInntekt(
                grunnpensjon + tilleggspensjon + afpTillegg + saertillegg
              )} kr`,
            },
          ].filter((rad) => rad.verdi !== '0 kr')
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
            verdi: `${formatInntekt(afp.kompensasjonstillegg)} kr`,
          },
          {
            tekst: 'Kronetillegg',
            verdi: `${formatInntekt(afp.kronetillegg)} kr`,
          },
          {
            tekst: 'Livsvarig del',
            verdi: `${formatInntekt(afp.livsvarig)} kr`,
          },
          {
            tekst: 'Sum AFP',
            verdi: `${formatInntekt(afp.maanedligBeloep)} kr`,
          },
        ].filter((rad) => rad.verdi !== '0 kr')
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
          verdi: `${formatInntekt(afpOffentligVedUttak?.maanedligBeloep ?? 0)} kr`,
        },
      ]
    })()

    const opptjeningPre2025OffentligAfpListe: DetaljRad[] = pre2025OffentligAfp
      ? [
          { tekst: 'AFP grad', verdi: pre2025OffentligAfp.afpGrad },
          {
            tekst: 'Sluttpoengtall',
            verdi: formatDecimalWithComma(pre2025OffentligAfp.sluttpoengtall),
          },
          {
            tekst: 'Poengår',
            verdi:
              (pre2025OffentligAfp.poengaarTom1991 ?? 0) +
              (pre2025OffentligAfp.poengaarFom1992 ?? 0),
          },
          { tekst: 'Trygdetid', verdi: pre2025OffentligAfp.trygdetid },
        ].filter(
          (rad) =>
            rad.verdi !== undefined &&
            (rad.tekst === 'Poengår' ||
              rad.tekst === 'Trygdetid' ||
              rad.verdi !== 0)
        )
      : []

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
