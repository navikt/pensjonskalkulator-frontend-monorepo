export const fulfilledGetPerson = {
  ['getPerson(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getPerson',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      navn: 'Aprikos',
      sivilstand: 'UGIFT',
      foedselsdato: '1963-04-30',
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fulfilledGetInntekt = {
  ['getInntekt(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getInntekt',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      beloep: 521338,
      aar: 2021,
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fulfilledGetEkskludertStatus = {
  ['getEkskludertStatus(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getEkskludertStatus',
    requestId: 't1wLPiRKrfe_vchftk8s8',
    data: { ekskludert: false, aarsak: 'NONE' },
    startedTimeStamp: 1714725797072,
    fulfilledTimeStamp: 1714725797669,
  },
}

export const fulfilledGetOmstillingsstoenadOgGjenlevende = {
  ['getOmstillingsstoenadOgGjenlevende(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getOmstillingsstoenadOgGjenlevende',
    requestId: 't1wLPiRKrfe_vchftk8s8',
    data: { harLoependeSak: true },
    startedTimeStamp: 1714725797072,
    fulfilledTimeStamp: 1714725797669,
  },
}

export const fulfilledGetLoependeVedtakUfoeregrad = {
  ['getLoependeVedtak(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getLoependeVedtak',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      alderspensjon: {
        loepende: false,
        grad: 0,
      },
      ufoeretrygd: {
        loepende: true,
        grad: 75,
      },
      afpPrivat: {
        loepende: false,
        grad: 0,
      },
      afpOffentlig: {
        loepende: false,
        grad: 0,
      },
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fulfilledGetLoependeVedtakLoependeAlderspensjon = {
  ['getLoependeVedtak(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getLoependeVedtak',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      alderspensjon: {
        loepende: true,
        grad: 100,
      },
      ufoeretrygd: {
        loepende: false,
        grad: 0,
      },
      afpPrivat: {
        loepende: false,
        grad: 0,
      },
      afpOffentlig: {
        loepende: false,
        grad: 0,
      },
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fulfilledGetLoependeVedtakLoependeAFPprivat = {
  ['getLoependeVedtak(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getLoependeVedtak',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      alderspensjon: {
        loepende: false,
        grad: 0,
      },
      ufoeretrygd: {
        loepende: false,
        grad: 0,
      },
      afpPrivat: {
        loepende: true,
        grad: 100,
      },
      afpOffentlig: {
        loepende: false,
        grad: 0,
      },
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fulfilledGetLoependeVedtakLoependeAFPoffentlig = {
  ['getLoependeVedtak(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getLoependeVedtak',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      alderspensjon: {
        loepende: false,
        grad: 0,
      },
      ufoeretrygd: {
        loepende: false,
        grad: 0,
      },
      afpPrivat: {
        loepende: false,
        grad: 0,
      },
      afpOffentlig: {
        loepende: true,
        grad: 100,
      },
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fulfilledGetTpoMedlemskap = {
  ['getTpoMedlemskap(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getTpoMedlemskap',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      tpLeverandoerListe: [
        'Statens pensjonskasse',
        'Kommunal Landspensjonskasse',
        'Oslo Pensjonsforsikring',
      ],
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fulfilledPensjonsavtaler = {
  ['pensjonsavtaler(undefined)']: {
    status: 'fulfilled',
    endpointName: 'pensjonsavtaler',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      avtaler: [],
      partialResponse: false,
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fulfilledAlderspensjonForLiteTrygdetid = {
  ['alderspensjon(undefined)']: {
    status: 'fulfilled',
    endpointName: 'alderspensjon',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      alderspensjon: [
        {
          alder: 75,
          beloep: 384120,
        },
        {
          alder: 76,
          beloep: 384440,
        },
        {
          alder: 77,
          beloep: 384492,
        },
      ],
      vilkaarsproeving: {
        vilkaarErOppfylt: true,
      },
      harForLiteTrygdetid: true,
    },

    fulfilledTimeStamp: 1688046412103,
  },
}

export const rejectedGetPerson = {
  ['getPerson(undefined)']: {
    status: 'rejected',
    endpointName: 'getPerson',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    error: {
      status: 'FETCH_ERROR',
      error: 'TypeError: Failed to fetch',
    },
  },
}

export const rejectedGetInntekt = {
  ['getInntekt(undefined)']: {
    status: 'rejected',
    endpointName: 'getInntekt',
    requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
    startedTimeStamp: 1714725265404,
    error: {
      status: 'FETCH_ERROR',
      error: 'TypeError: Failed to fetch',
    },
  },
}

export const rejectedGetEkskludertStatus = {
  ['getEkskludertStatus(undefined)']: {
    status: 'rejected',
    endpointName: 'getEkskludertStatus',
    requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
    startedTimeStamp: 1714725265404,
    error: {
      status: 'FETCH_ERROR',
      error: 'TypeError: Failed to fetch',
    },
  },
}

export const rejectedGetOmstillingsstoenadOgGjenlevende = {
  ['getOmstillingsstoenadOgGjenlevende(undefined)']: {
    status: 'rejected',
    endpointName: 'getOmstillingsstoenadOgGjenlevende',
    requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
    startedTimeStamp: 1714725265404,
    error: {
      status: 'FETCH_ERROR',
      error: 'TypeError: Failed to fetch',
    },
  },
}
