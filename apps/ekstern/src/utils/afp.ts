export const formatAfp = (afp: AfpRadio): string => {
  switch (afp) {
    case 'ja_offentlig': {
      return 'Offentlig'
    }
    case 'ja_privat': {
      return 'Privat'
    }
    case 'vet_ikke': {
      return 'Vet ikke'
    }
    case 'nei': {
      return 'Nei'
    }

    default: {
      return 'Vet ikke'
    }
  }
}
