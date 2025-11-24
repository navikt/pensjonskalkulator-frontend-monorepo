import React from 'react'

import { ShowMoreRef } from '@/components/common/ShowMore/ShowMore'

export type AvansertBeregningModus = 'redigering' | 'resultat'

export type ShowPDFRef = {
  handlePDF: () => void
}

interface BeregningContextType {
  avansertSkjemaModus: AvansertBeregningModus
  setAvansertSkjemaModus: React.Dispatch<
    React.SetStateAction<AvansertBeregningModus>
  >
  harAvansertSkjemaUnsavedChanges: boolean
  setHarAvansertSkjemaUnsavedChanges: React.Dispatch<
    React.SetStateAction<boolean>
  >
  pensjonsavtalerShowMoreRef?: React.RefObject<ShowMoreRef | null>
  showPDFRef?: React.RefObject<ShowPDFRef | null>
  setIsPdfReady?: (ready: boolean) => void
}

export const BeregningContext = React.createContext<BeregningContextType>({
  pensjonsavtalerShowMoreRef: undefined,
  showPDFRef: undefined,
  setIsPdfReady: undefined,
  avansertSkjemaModus: 'redigering',
  setAvansertSkjemaModus: () => {},
  harAvansertSkjemaUnsavedChanges: false,
  setHarAvansertSkjemaUnsavedChanges: () => {},
})
