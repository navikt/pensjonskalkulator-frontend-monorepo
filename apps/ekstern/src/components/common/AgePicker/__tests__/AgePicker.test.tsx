import { describe, it, vi } from 'vitest'

import { AgePicker } from '..'
import { fulfilledGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, fireEvent, waitFor } from '@/test-utils'

describe('AgePicker', () => {
  it('rendrer riktig default verdier, description og info', () => {
    const { asFragment, container } = render(
      <AgePicker
        name="unique-name"
        label="My Test Age Picker"
        description="My Description"
        info="My Infobox"
      />
    )

    expect(screen.getByTestId('age-picker-unique-name')).toBeVisible()
    expect(screen.getByText('My Test Age Picker')).toBeVisible()
    expect(container.querySelector(`[name="unique-name-aar"]`)).toBeVisible()
    expect(
      container.querySelector(`[name="unique-name-maaneder"]`)
    ).toBeVisible()
    expect(screen.getByText('My Description')).toBeVisible()
    expect(screen.getByText('My Infobox')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  describe('rendrer riktig valg i select', () => {
    it('med default min og max', () => {
      const { container } = render(
        <AgePicker name="unique-name" label="My Test Age Picker" />,
        {
          preloadedState: {
            api: {
              //@ts-ignore
              queries: {
                ...fulfilledGetPerson,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      expect(screen.getByTestId('age-picker-unique-name')).toBeVisible()
      expect(screen.getByText('My Test Age Picker')).toBeVisible()
      const selectAarElement = container.querySelector(
        `[name="unique-name-aar"]`
      )
      const optionAarElements = selectAarElement?.querySelectorAll('option')
      expect(optionAarElements?.length).toBe(15)
      expect(optionAarElements?.[0].value).toBe('')
      expect(optionAarElements?.[1].value).toBe('62')
      expect(optionAarElements?.[14].value).toBe('75')
      const selectMaanederElement = container.querySelector(
        `[name="unique-name-maaneder"]`
      )

      expect(selectMaanederElement?.querySelectorAll('option')?.length).toBe(1)

      fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
        target: { value: '70' },
      })

      const optionMaanederElements =
        selectMaanederElement?.querySelectorAll('option')

      expect(optionMaanederElements?.length).toBe(13)
      expect(optionMaanederElements?.[0].value).toBe('')
      expect(optionMaanederElements?.[1].value).toBe('0')
      expect(optionMaanederElements?.[12].value).toBe('11')
    })

    it('med custom min og max', () => {
      const { container } = render(
        <AgePicker
          name="unique-name"
          label="My Test Age Picker"
          minAlder={{ aar: 70, maaneder: 5 }}
          maxAlder={{ aar: 72, maaneder: 0 }}
        />,
        {
          preloadedState: {
            api: {
              //@ts-ignore
              queries: {
                ...fulfilledGetPerson,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      expect(screen.getByTestId('age-picker-unique-name')).toBeVisible()
      expect(screen.getByText('My Test Age Picker')).toBeVisible()
      const selectAarElement = container.querySelector(
        `[name="unique-name-aar"]`
      )
      const optionAarElements = selectAarElement?.querySelectorAll('option')
      expect(optionAarElements?.length).toBe(4)
      expect(optionAarElements?.[0].value).toBe('')
      expect(optionAarElements?.[1].value).toBe('70')
      expect(optionAarElements?.[3].value).toBe('72')
      const selectMaanederElement = container.querySelector(
        `[name="unique-name-maaneder"]`
      )

      expect(selectMaanederElement?.querySelectorAll('option')?.length).toBe(1)

      fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
        target: { value: '71' },
      })

      const optionMaanederElements =
        selectMaanederElement?.querySelectorAll('option')
      expect(optionMaanederElements?.length).toBe(13)
      expect(optionMaanederElements?.[0].value).toBe('')
      expect(optionMaanederElements?.[1].value).toBe('0')
      expect(optionMaanederElements?.[12].value).toBe('11')
    })

    describe('Når min/maxAlder er oppgitt og år er valgt', () => {
      it('viser bare månedene som kan velges basert mellom min og max mellom to år', () => {
        const { container } = render(
          <AgePicker
            name="unique-name"
            label="My Test Age Picker"
            minAlder={{ aar: 70, maaneder: 5 }}
            maxAlder={{ aar: 72, maaneder: 10 }}
          />
        )

        expect(screen.getByTestId('age-picker-unique-name')).toBeVisible()
        expect(screen.getByText('My Test Age Picker')).toBeVisible()

        const selectMaanederElement = container.querySelector(
          `[name="unique-name-maaneder"]`
        )

        fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
          target: { value: '70' },
        })

        expect(selectMaanederElement?.querySelectorAll('option')?.length).toBe(
          8
        )

        fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
          target: { value: '71' },
        })

        expect(selectMaanederElement?.querySelectorAll('option')?.length).toBe(
          13
        )

        fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
          target: { value: '72' },
        })

        expect(selectMaanederElement?.querySelectorAll('option')?.length).toBe(
          12
        )
      })

      it('viser bare månedene som kan velges basert mellom min og max innen samme år', () => {
        const { container } = render(
          <AgePicker
            name="unique-name"
            label="My Test Age Picker"
            minAlder={{ aar: 75, maaneder: 0 }}
            maxAlder={{ aar: 75, maaneder: 0 }}
          />
        )

        expect(screen.getByTestId('age-picker-unique-name')).toBeVisible()
        expect(screen.getByText('My Test Age Picker')).toBeVisible()

        const selectMaanederElement = container.querySelector(
          `[name="unique-name-maaneder"]`
        )

        fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
          target: { value: '75' },
        })

        expect(selectMaanederElement?.querySelectorAll('option')?.length).toBe(
          2
        )
      })
    })
  })

  it('viser feilmelding når error er fylt ut', () => {
    render(
      <AgePicker
        name="unique-name"
        label="My Test Age Picker"
        error="My Error"
      />
    )
    expect(screen.getByText('My Error')).toBeVisible()
    expect(
      screen
        .getByTestId('age-picker-unique-name-aar')
        .getAttribute('aria-describedby')
    ).toBe('unique-name-error')
    expect(
      screen
        .getByTestId('age-picker-unique-name-maaneder')
        .getAttribute('aria-describedby')
    ).toBe('unique-name-error')
  })

  it('viser aria-invalid attribut på riktig felt når error er fylt ut', () => {
    render(
      <AgePicker
        name="unique-name"
        label="My Test Age Picker"
        error="My Error"
      />
    )
    // Når ingen av de feltene er fylt ut
    expect(
      screen
        .getByTestId('age-picker-unique-name-aar')
        .getAttribute('aria-invalid')
    ).toBe('true')
    expect(
      screen
        .getByTestId('age-picker-unique-name-maaneder')
        .getAttribute('aria-invalid')
    ).toBe('true')

    // Når bare år er fylt ut
    fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
      target: { value: '72' },
    })
    waitFor(() => {
      expect(
        screen
          .getByTestId('age-picker-unique-name-aar')
          .getAttribute('aria-invalid')
      ).toBe('false')
      expect(
        screen
          .getByTestId('age-picker-unique-name-maaneder')
          .getAttribute('aria-invalid')
      ).toBe('true')
    })

    // Når år og måned er fylt ut
    fireEvent.change(screen.getByTestId('age-picker-unique-name-maaneder'), {
      target: { value: '0' },
    })
    expect(
      screen
        .getByTestId('age-picker-unique-name-aar')
        .getAttribute('aria-invalid')
    ).toBe('true')
    expect(
      screen
        .getByTestId('age-picker-unique-name-maaneder')
        .getAttribute('aria-invalid')
    ).toBe('true')
    expect(
      screen
        .getByTestId('age-picker-unique-name-aar')
        .getAttribute('aria-invalid')
    ).toBe('true')
    expect(
      screen
        .getByTestId('age-picker-unique-name-maaneder')
        .getAttribute('aria-invalid')
    ).toBe('true')

    // Når bare måned er fylt ut kan ikke testes fordi monthArray er tom så lenge år ikke e rvalgt
  })

  it('kaller onChange når option velges i år eller måneder, og Select for måneder enables når år er valgt', () => {
    const onChangeMock = vi.fn()
    const { container } = render(
      <AgePicker
        name="unique-name"
        label="My Test Age Picker"
        onChange={onChangeMock}
      />,
      {
        preloadedState: {
          api: {
            //@ts-ignore
            queries: {
              ...fulfilledGetPerson,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
    )

    expect(
      container.querySelector(`[name="unique-name-maaneder"]`)
    ).toBeDisabled()

    fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
      target: { value: '72' },
    })
    expect(onChangeMock).toHaveBeenCalledTimes(1)
    expect(
      container.querySelector(`[name="unique-name-maaneder"]`)
    ).not.toBeDisabled()

    fireEvent.change(screen.getByTestId('age-picker-unique-name-maaneder'), {
      target: { value: '5' },
    })
    expect(onChangeMock).toHaveBeenCalledTimes(2)
  })
})
