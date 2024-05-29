export const fullfilledGetPerson = {
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

export const fullfilledGetInntekt = {
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

export const fullfilledGetEkskludertStatus = {
  ['getEkskludertStatus(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getEkskludertStatus',
    requestId: 't1wLPiRKrfe_vchftk8s8',
    data: { ekskludert: false, aarsak: 'NONE' },
    startedTimeStamp: 1714725797072,
    fulfilledTimeStamp: 1714725797669,
  },
}

export const fullfilledGetOmstillingsstoenadOgGjenlevende = {
  ['getOmstillingsstoenadOgGjenlevende(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getOmstillingsstoenadOgGjenlevende',
    requestId: 't1wLPiRKrfe_vchftk8s8',
    data: { harLoependeSak: false },
    startedTimeStamp: 1714725797072,
    fulfilledTimeStamp: 1714725797669,
  },
}

export const fullfilledGetUfoeregrad = {
  ['getUfoeregrad(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getUfoeregrad',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      ufoeregrad: 75,
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fullfilledGetTpoMedlemskap = {
  ['getTpoMedlemskap(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getTpoMedlemskap',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: {
      harTjenestepensjonsforhold: 'true',
    },
    fulfilledTimeStamp: 1688046412103,
  },
}

export const fullfilledPensjonsavtaler = {
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
