describe('Pensjonskalkulator', () => {
  it('rendrer stegsvisning.', () => {
    cy.login()
    cy.injectAxe()

    // Sjekker Start steg
    cy.contains('Hei Aprikos!')
    cy.checkA11y('main')
    cy.contains('button', 'Kom i gang').click()

    // Sjekker Sivilstand steg
    cy.contains('Sivilstand')
    cy.checkA11y('main')
    cy.get('select[name="sivilstand"]').select(1)
    cy.get('input[name="epsHarPensjon"][value="nei"]').check()
    cy.get('input[name="epsHarInntektOver2G"][value="nei"]').check()
    cy.contains('button', 'Neste').click()

    // Sjekker utenlandsopphold steg
    cy.contains('Opphold utenfor Norge')
    cy.checkA11y('main')
    cy.get('[type="radio"]').first().check()
    cy.get('[data-testid="legg-til-utenlandsopphold"]').click({
      force: true,
    })
    cy.get('[data-testid="utenlandsopphold-land"]').select('Spania')
    cy.get('[data-testid="utenlandsopphold-arbeidet-utenlands-ja"]').check()
    cy.get('[data-testid="utenlandsopphold-startdato"]')
      .clear()
      .type('30.04.1981')
    cy.checkA11y('main')
    cy.contains('button', 'Legg til opphold').click({
      force: true,
    })
    cy.contains('button', 'Neste').click({
      force: true,
    })

    // Sjekker AFP steg
    cy.contains('AFP (avtalefestet pensjon)')
    cy.get('[data-testid="om_livsvarig_AFP_i_offentlig_sektor"]').click()
    cy.get('[type="radio"]').first().check()
    cy.checkA11y('main')
    cy.contains('button', 'Neste').click()

    // Hopper over AFP + Uføre steg

    // Sjekker AFP Samtykke steg
    cy.get('[data-testid="samtykke-offentlig-afp-title"]').should('exist')
    cy.checkA11y('main')
    cy.get('[type="radio"]').first().check()
    cy.contains('button', 'Neste').click()

    // Sjekker Samtykke steg
    cy.contains('Pensjonsavtaler')
    cy.checkA11y('main')
    cy.get('[type="radio"]').first().check()
    cy.contains('button', 'Neste').click()
  })

  it('rendrer resultatsside for enkel uten a11y-feil.', () => {
    cy.login()
    cy.fillOutStegvisning({})

    // Sjekker Beregning
    cy.wait('@fetchTidligsteUttaksalder')
    cy.contains(
      'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er'
    )
    cy.contains('button', '70 år').click()
    cy.injectAxe()
    cy.wait('@fetchAlderspensjon')
    cy.contains('Pensjonsgivende inntekt frem til uttak')
    cy.contains('Alderspensjon')
    cy.contains('AFP')
    cy.contains('button', 'Sivilstand').click({ force: true })
    cy.contains('button', 'Opphold utenfor Norge').click({ force: true })
    cy.checkA11y('main')
  })

  it('rendrer skjemaet og resultatsside for avansert uten a11y-feil.', () => {
    cy.login()
    cy.fillOutStegvisning({})
    cy.wait('@fetchTidligsteUttaksalder')
    cy.get('[data-testid="toggle-avansert"]').within(() => {
      cy.contains('Avansert').click()
    })
    cy.injectAxe()
    cy.contains('Pensjonsgivende årsinntekt frem til pensjon').should('exist')

    cy.checkA11y('main')

    cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select('65')
    cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]').select(
      '3'
    )
    cy.get('[data-testid="uttaksgrad"]').select('40 %')
    cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
    cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
    cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select('67')
    cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]').select(
      '0'
    )
    cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
    cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

    cy.get(
      '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
    ).select('75')
    cy.get(
      '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
    ).select('0')

    cy.contains('Beregn pensjon').click()
    cy.contains('Beregning').should('exist')
    cy.checkA11y('main')
  })

  it('Når brukeren ikke oppfyller vilkaar for valgt uttaksalder, rendrer skjemaet med forslag om annet uttak uten a11y-feil.', () => {
    cy.login()
    cy.fillOutStegvisning({})
    cy.wait('@fetchTidligsteUttaksalder')
    cy.get('[data-testid="toggle-avansert"]').within(() => {
      cy.contains('Avansert').click()
    })
    cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select('65')
    cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]').select(
      '1'
    )
    cy.get('[data-testid="uttaksgrad"]').select('100 %')
    cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-nei"]').check()

    cy.intercept(
      {
        method: 'POST',
        url: '/pensjon/kalkulator/api/v9/alderspensjon/simulering',
      },
      {
        alderspensjon: [],
        vilkaarsproeving: {
          vilkaarErOppfylt: false,
          alternativ: {
            heltUttaksalder: { aar: 65, maaneder: 3 },
          },
        },
      }
    ).as('fetchAlderspensjon')
    cy.contains('Beregn pensjon').click()

    cy.contains('Beregning').should('not.exist')
    cy.contains('Pensjonsgivende årsinntekt frem til pensjon').should('exist')
    cy.contains(
      'Opptjeningen din er ikke høy nok til ønsket uttak. Du må øke alderen eller sette ned uttaksgraden.'
    ).should('exist')
    cy.injectAxe()
    cy.checkA11y('main')
  })

  it('rendrer informasjonsside når vedlikeholdsmodus er på uten a11y-feil', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/pensjon/kalkulator/api/feature/pensjonskalkulator.vedlikeholdsmodus',
      },
      {
        statusCode: 200,
        body: {
          enabled: true,
        },
      }
    ).as('fetchVedlikeholdsmodus')
    cy.visit('/pensjon/kalkulator/')
    cy.wait('@getAuthSession')
    cy.contains('button', 'Pensjonskalkulator').click()
    cy.wait('@fetchVedlikeholdsmodus')
    cy.injectAxe()
    cy.checkA11y('main')
  })

  it('rendrer andre sider uten a11y-feil.', () => {
    // Navigate til forbehold
    cy.visit('/pensjon/kalkulator/forbehold')
    cy.injectAxe()
    cy.checkA11y('main')

    // Navigate til personopplysninger
    cy.visit('/pensjon/kalkulator/personopplysninger')
    cy.injectAxe()
    cy.checkA11y('main')

    //  Navigate til 404
    cy.visit('/pensjon/kalkulator/tulleside')
    cy.injectAxe()
    cy.checkA11y('main')
  })
})

export {}
