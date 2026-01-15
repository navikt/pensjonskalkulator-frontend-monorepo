import { NAV_LOGO } from './constants'
import { getCurrentDateTimeFormatted } from './utils'

export const getPdfHeader = ({
  isEnkel,
  person,
}: {
  isEnkel: boolean
  person?: Person
}): string => {
  return `<table role='presentation' style='width: 100%; margin-bottom: 1em;'>
    <tr class="header-with-logo">
      <td style='width: 70%;'>
        <h1>Pensjonskalkulator: <span style='font-weight: 200;'>${isEnkel ? 'Enkel' : 'Avansert'} beregning</span></h1>
      </td>
      <td style='text-align: right; width: 30%;'>
        <span class='logoContainer'>
          ${NAV_LOGO}
        </span>
      </td>
    </tr>
  </table>
  <div class="pdf-metadata">
    ${person?.navn}
    <span 
      style="padding: 0 8px; font-size: 16px; font-weight: 800;"
    >\u2022</span>
    Dato opprettet: ${getCurrentDateTimeFormatted()}
  </div>`
}
