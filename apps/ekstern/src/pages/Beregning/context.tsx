import React from 'react'

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
}

export const BeregningContext = React.createContext<BeregningContextType>({
  avansertSkjemaModus: 'redigering',
  setAvansertSkjemaModus: () => {},
  harAvansertSkjemaUnsavedChanges: false,
  setHarAvansertSkjemaUnsavedChanges: () => {},
})
