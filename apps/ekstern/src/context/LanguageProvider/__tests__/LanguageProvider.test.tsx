import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { useIntl } from 'react-intl'
import { Provider } from 'react-redux'

import { SanityContext } from '@/context/SanityContext'
import { mockErrorResponse } from '@/mocks/server'
import { sanityClient } from '@/utils/sanity'

import { setupStore } from '../../../state/store'
import { LanguageProvider } from '../LanguageProvider'

function TestComponent() {
  const intl = useIntl()
  const { forbeholdAvsnittData, guidePanelData, readMoreData } =
    React.useContext(SanityContext)

  return (
    <div data-testid="test-component">
      <p>{intl.formatMessage({ id: 'pageframework.title' })}</p>
      <p data-testid="readmore-data-length">
        {Object.keys(readMoreData).length}
      </p>
      <p data-testid="forbehold-avsnitt-length">
        {forbeholdAvsnittData.length}
      </p>
      <p data-testid="guidepanel-data-length">
        {Object.keys(guidePanelData).length}
      </p>
    </div>
  )
}

describe('LanguageProvider', () => {
  afterEach(() => {
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
  })

  it('gir tilgang til react-intl translations', async () => {
    const storeRef = setupStore(undefined, true)
    render(
      <Provider store={storeRef}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </Provider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('test-component')).toHaveTextContent(
        'Pensjonskalkulator'
      )
    })
  })

  it('bruker locale fra cookie når den er tilgjengelig', async () => {
    const storeRef = setupStore(undefined, true)
    document.cookie = 'decorator-language=en'
    render(
      <Provider store={storeRef}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('test-component')).toHaveTextContent(
        'Pension Calculator'
      )
      expect(document.documentElement.lang).toBe('en')
    })
  })

  it('fetcher tekster fra Sanity i norsk bokmål som default, og videre med riktig locale, og lagrer det i Context', async () => {
    const dummyResp = [
      {
        language: 'nb',
        _id: '1e9a7d23-eb88-4bd2-ad8d-15843cf47952',
        _createdAt: '2024-10-07T11:55:49Z',
        _type: 'random',
        name: 'hva_er_opphold_utenfor_norge',
        _updatedAt: '2025-01-16T15:26:45Z',
        overskrift: 'Hva som er opphold utenfor Norge',
        _rev: 'IZ4ZA8avncRcTDvyuMLOnJ',
        innhold: [],
      },
      {
        overskrift: 'Betydning av opphold utenfor Norge for pensjon',
        _rev: 'aW9ZvtW6d5z6x1Negh1PL7',
        name: 'betydning_av_opphold_utenfor_norge',
        language: 'nb',
        _id: '88dfc74a-9878-4753-88a3-4ded8c846fee',
        _updatedAt: '2025-01-17T07:58:59Z',
        _createdAt: '2025-01-17T07:54:30Z',
        _type: 'random',
        innhold: [],
      },
      {
        overskrift: 'Om livsvarig AFP i offentlig sektor',
        _rev: 'aW9ZvtW6d5z6x1Negh1PL7',
        name: 'om_livsvarig_afp_i_offentlig_sektor',
        language: 'nb',
        _id: '88dfc74a-9878-4753-88a3-4ded8c846fee',
        _updatedAt: '2025-01-17T07:58:59Z',
        _createdAt: '2025-01-17T07:54:30Z',
        _type: 'random',
        innhold: [],
      },
    ]

    const sanityClientFetchMock = vi
      .spyOn(sanityClient, 'fetch') // @ts-ignore
      .mockReturnValue(Promise.resolve(dummyResp))

    const storeRef = setupStore(undefined, true)
    document.cookie = 'decorator-language=en'
    render(
      <Provider store={storeRef}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </Provider>
    )

    await waitFor(() => {
      expect(sanityClientFetchMock).toHaveBeenCalledTimes(6)

      expect(sanityClientFetchMock.mock.calls[0]).toStrictEqual([
        '*[_type == "forbeholdAvsnitt" && language == $locale] | order(order asc) | {overskrift,innhold}',
        { locale: 'nb' },
      ])
      expect(sanityClientFetchMock.mock.calls[1]).toStrictEqual([
        '*[_type == "guidepanel" && language == $locale] | {name,overskrift,innhold}',
        { locale: 'nb' },
      ])
      expect(sanityClientFetchMock.mock.calls[2]).toStrictEqual([
        '*[_type == "readmore" && language == $locale] | {name,overskrift,innhold}',
        { locale: 'nb' },
      ])
      expect(sanityClientFetchMock.mock.calls[3]).toStrictEqual([
        '*[_type == "forbeholdAvsnitt" && language == $locale] | order(order asc) | {overskrift,innhold}',
        { locale: 'en' },
      ])
      expect(sanityClientFetchMock.mock.calls[4]).toStrictEqual([
        '*[_type == "guidepanel" && language == $locale] | {name,overskrift,innhold}',
        { locale: 'en' },
      ])
      expect(sanityClientFetchMock.mock.calls[5]).toStrictEqual([
        '*[_type == "readmore" && language == $locale] | {name,overskrift,innhold}',
        { locale: 'en' },
      ])
    })

    await waitFor(() => {
      expect(screen.getByTestId('readmore-data-length')).toHaveTextContent('3')
      expect(screen.getByTestId('forbehold-avsnitt-length')).toHaveTextContent(
        '3'
      )
      expect(screen.getByTestId('guidepanel-data-length')).toHaveTextContent(
        '3'
      )
    })
  })

  it('bruker norsk bokmål uansett når kall til feature toggle feiler', async () => {
    const storeRef = setupStore(undefined, true)
    document.cookie = 'decorator-language=en'
    mockErrorResponse('/feature/pensjonskalkulator.disable-spraakvelger')

    render(
      <Provider store={storeRef}>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </Provider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('test-component')).toHaveTextContent(
        'Pensjonskalkulator'
      )
    })
  })
})
