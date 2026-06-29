import { Events } from '@navikt/nav-dekoratoren-moduler'

// Constants for logger function calls to avoid SonarLint duplicate string warnings

// Button click events
export const KNAPP_KLIKKET = Events.KNAPP_KLIKKET
// TODO: fjern når amplitude er ikke i bruk lenger
export const BUTTON_KLIKK = 'button click'

// Form validation events
export const SKJEMA_VALIDERING_FEILET = Events.SKJEMA_VALIDERING_FEILET

// Radio group selection events
export const RADIOGROUP_VALGT = 'radiogroup valgt'

// Modal opening events
export const MODAL_AAPNET = Events.MODAL_APNET

// Link opening events
export const LINK_AAPNET = Events.LINK_KLIKKET
export const LINK_AAPNET_OLD = 'link åpnet' // TODO: fjern når amplitude er ikke i bruk lenger

// Selection events
export const NEDTREKKSISTE_VALG_ENDRET = Events.NEDTREKKSLISTE_VALG_ENDRET

// UI interaction events
export const GRAF_TOOLTIP_AAPNET = 'graf tooltip åpnet'
export const GRUNNLAG_FOR_BEREGNINGEN = 'grunnlag for beregningen'
export const SHOW_MORE_AAPNET = 'show more åpnet'
export const SHOW_MORE_LUKKET = 'show more lukket'
export const ALERT_VIST = Events.ALERT_VIST
