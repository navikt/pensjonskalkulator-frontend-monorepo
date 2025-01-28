import { setAvailableLanguages } from '@navikt/nav-dekoratoren-moduler'

// TODO testen dekker ikke refetch av data. Kan den forbedres ved at man velger språk gjennom språkvelgeren i dekoratøren? Noe som vil utløse refetch av data + setting av cookie.
describe('Språkvelger', () => {
  it('setter Norsk Bokmål som default språk i løsningen for innhold styrt av react-intl og Sanity', () => {
    cy.login()
    setAvailableLanguages([
      {
        locale: 'nb',
        handleInApp: true,
      },
      {
        locale: 'nn',
        handleInApp: true,
      },
      {
        locale: 'en',
        handleInApp: true,
      },
    ])

    // Går videre fra Start steget
    cy.contains('button', 'Kom i gang').click()

    // Går videre fra Sivilstand steg
    cy.contains('Din sivilstand')
    cy.get('[type="radio"]').first().check()
    cy.contains('button', 'Neste').click()

    // Sjekker default språk på utenlandsopphold steg
    cy.contains('Opphold utenfor Norge')
    cy.contains('Hva som er opphold utenfor Norge (Sanity)')
  })

  it('setter riktig språk i løsningen basert på cookie fra dekoratøren for innhold styrt av react-intl og Sanity', () => {
    cy.intercept(
      {
        method: 'GET',
        url: `https://g2by7q6m.apicdn.sanity.io/v2023-05-03/data/query/development?query=*%5B_type+%3D%3D+%22readmore%22+%26%26*`,
      },
      {
        result: [
          {
            language: 'en',
            _id: '1e9a7d23-eb88-4bd2-ad8d-15843cf47952',
            _createdAt: '2024-10-07T11:55:49Z',
            _type: 'readmore',
            name: 'hva_er_opphold_utenfor_norge',
            _updatedAt: '2025-01-16T15:26:45Z',
            overskrift: 'My english text (Sanity)',
            _rev: 'IZ4ZA8avncRcTDvyuMLOnJ',
            innhold: [
              {
                markDefs: [],
                children: [
                  {
                    _type: 'span',
                    marks: [],
                    text: 'Lorem',
                    _key: 'b471491421e40',
                  },
                ],
                level: 1,
                _type: 'block',
                style: 'normal',
                _key: '9ce30059abdd',
                listItem: 'bullet',
              },
            ],
          },
        ],
        syncTags: ['s1:EmCcjQ'],
        ms: 4,
      }
    ).as('fetchSanityReadMoreData')

    cy.visit('/pensjon/kalkulator/')
    cy.wait('@getAuthSession')

    cy.contains('button', 'Pension Calculator').click()
    // På start steget kjøres automatisk kall til  /person, /ekskludert, /inntekt, /loepende-omstillingsstoenad-eller-gjenlevendeytelse
    cy.wait('@getPerson')
    cy.wait('@getEkskludertStatus')
    cy.wait('@getInntekt')
    cy.wait('@getOmstillingsstoenadOgGjenlevende')
    cy.wait('@getLoependeVedtak')

    setAvailableLanguages([
      {
        locale: 'nb',
        handleInApp: true,
      },
      {
        locale: 'nn',
        handleInApp: true,
      },
      {
        locale: 'en',
        handleInApp: true,
      },
    ])

    const expires = new Date(Date.now() + 1 * 864e5).toUTCString()
    document.cookie =
      'decorator-language' +
      '=' +
      encodeURIComponent('en') +
      '; expires=' +
      expires +
      '; path=' +
      '/'

    // Går videre fra Start steget
    cy.contains('button', 'Get Started').click()

    // Går videre fra Sivilstand steg
    cy.contains('Your Marital Status')
    cy.get('[type="radio"]').first().check()
    cy.contains('button', 'Next').click()

    // Sjekker engelsk språk på utenlandsopphold steg
    cy.contains('Time abroad')
    cy.contains('My english text (Sanity)')
  })
})

export {}
