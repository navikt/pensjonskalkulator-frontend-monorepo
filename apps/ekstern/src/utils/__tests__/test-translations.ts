import { externalLinks } from '../translations'

const translationsForExternalLinks = Object.fromEntries(
  externalLinks.map((key) => [
    `translation.test.${key}Link`,
    `lorem ipsum dolor <${key}Link>my link</${key}Link>`,
  ])
)

export default {
  ...translationsForExternalLinks,
  'translation.test.br': 'lorem{br}ipsum{br}{br}dolor',
  'translation.test.strong': 'lorem<strong>ipsum</strong>dolor',
  'translation.test.nowrap': 'lorem<nowrap>ipsum</nowrap>dolor',
}
