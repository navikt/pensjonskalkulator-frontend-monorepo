import { IntlShape } from 'react-intl'

export const formatAfp = (intl: IntlShape, afp: AfpRadio): string => {
  switch (afp) {
    case 'ja_offentlig': {
      return intl.formatMessage({ id: 'afp.offentlig' })
    }
    case 'ja_privat': {
      return intl.formatMessage({ id: 'afp.privat' })
    }
    case 'vet_ikke': {
      return intl.formatMessage({ id: 'afp.vet_ikke' })
    }
    case 'nei': {
      return intl.formatMessage({ id: 'afp.nei' })
    }

    default: {
      return intl.formatMessage({ id: 'afp.vet_ikke' })
    }
  }
}
