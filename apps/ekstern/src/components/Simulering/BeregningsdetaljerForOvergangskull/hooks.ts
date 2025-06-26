import { useMemo } from 'react'

import { useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { formatInntekt } from '@/utils/inntekt'

export interface DetaljRad {
  tekst: string
  verdi?: number | string
}

export interface BeregningsdetaljerRader {
  alderspensjonDetaljerListe: DetaljRad[][]
  pre2025OffentligAfpDetaljerListe: DetaljRad[]
  opptjeningKap19Liste: DetaljRad[][]
  opptjeningKap20Liste: DetaljRad[][]
  afpPrivatDetaljerListe: DetaljRad[][]
  afpOffentligDetaljerListe: DetaljRad[]
  opptjeningPre2025OffentligAfpListe: DetaljRad[]
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
    const indices: number[] = []
    if (
      gradertUttaksperiode &&
      uttaksalder &&
      alderspensjonListe &&
      alderspensjonListe.length > 0
    ) {
      // Finner index for uttaksalder
      const uttaksIndex = alderspensjonListe.findIndex(
        (ap) => ap.alder === uttaksalder.aar
      )

      // Finner index for gradertUttaksperiode
      const gradertIndex = alderspensjonListe.findIndex(
        (ap) => ap.alder === gradertUttaksperiode.uttaksalder.aar
      )

      // Hvis uttaksalder og gradertUttaksperiode har samme år, prioriter gradertUttaksperiode
      if (uttaksalder.aar === gradertUttaksperiode.uttaksalder.aar) {
        if (gradertIndex !== -1) {
          indices.push(gradertIndex)
        }
      } else {
        // Forskjellige år - inkluder begge hvis de finnes
        if (gradertIndex !== -1) {
          indices.push(gradertIndex)
        }
        if (uttaksIndex !== -1) {
          indices.push(uttaksIndex)
        }
      }
    } else if (
      uttaksalder &&
      alderspensjonListe &&
      alderspensjonListe.length > 0
    ) {
      // Kun uttaksalder, ingen gradertUttaksperiode
      const uttaksIndex = alderspensjonListe.findIndex(
        (ap) => ap.alder === uttaksalder.aar
      )
      if (uttaksIndex !== -1) {
        indices.push(uttaksIndex)
      }
    }

    if (indices.length === 0 && alderspensjonListe?.[0]) {
      indices.push(0)
    }

    const alderspensjonDetaljerListe: DetaljRad[][] = indices.map((index) => {
      const ap = alderspensjonListe?.[index]
      if (!ap) return []
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
    })

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

    const opptjeningKap19Liste: DetaljRad[][] = indices.map((index) => {
      const ap = alderspensjonListe?.[index]
      if (!ap || ap.andelsbroekKap19 === 0) {
        return []
      }

      return [
        {
          tekst: 'Andelsbrøk',
          verdi: ap.andelsbroekKap19 ? `${ap.andelsbroekKap19 * 10}/10` : 0,
        },
        { tekst: 'Sluttpoengtall', verdi: ap.sluttpoengtall },
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
    })

    const opptjeningKap20Liste: DetaljRad[][] = indices.map((index) => {
      const ap = alderspensjonListe?.[index]
      if (!ap || ap.andelsbroekKap20 === 0) {
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
    })

    const afpOffentligDetaljerListe: DetaljRad[] = (() => {
      if (!afpOffentligListe || afpOffentligListe.length === 0) {
        return []
      }

      const lastAfpElement = afpOffentligListe[afpOffentligListe.length - 1]

      return [
        {
          tekst: 'Månedlig livsvarig avtalefestet pensjon (AFP)',
          verdi: `${formatInntekt(lastAfpElement.maanedligBeloep)} kr`,
        },
      ].filter((rad) => rad.verdi !== '0 kr')
    })()

    const opptjeningPre2025OffentligAfpListe: DetaljRad[] = pre2025OffentligAfp
      ? [
          { tekst: 'AFP grad', verdi: pre2025OffentligAfp.afpGrad },
          {
            tekst: 'Sluttpoengtall',
            verdi: pre2025OffentligAfp.sluttpoengtall,
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
      opptjeningKap19Liste,
      opptjeningKap20Liste,
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
