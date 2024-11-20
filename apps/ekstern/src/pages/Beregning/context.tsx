import React from 'react'

import { ShowMoreRef } from '@/components/common/ShowMore/ShowMore'

export type AvansertBeregningModus = 'redigering' | 'resultat'

interface BeregningContextType {
  avansertSkjemaModus: AvansertBeregningModus
  setAvansertSkjemaModus: React.Dispatch<
    React.SetStateAction<AvansertBeregningModus>
  >
  harAvansertSkjemaUnsavedChanges: boolean
  setHarAvansertSkjemaUnsavedChanges: React.Dispatch<
    React.SetStateAction<boolean>
  >
  pensjonsavtalerShowMoreRef?: React.RefObject<ShowMoreRef>
}

export const BeregningContext = React.createContext<BeregningContextType>({
  pensjonsavtalerShowMoreRef: undefined,
  avansertSkjemaModus: 'redigering',
  setAvansertSkjemaModus: () => {},
  harAvansertSkjemaUnsavedChanges: false,
  setHarAvansertSkjemaUnsavedChanges: () => {},
})
