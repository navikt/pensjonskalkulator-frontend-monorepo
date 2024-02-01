import { describe, it, vi } from 'vitest'

import { AgePicker } from '..'
import { render, screen, fireEvent } from '@/test-utils'

// Legger til test med aT SELECT FOR MÅNED ER DISABLED, OG AKTIVERT NÅR ÅR ENDRES. TESTE AT MÅNED NULLSTILLES
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
        <AgePicker name="unique-name" label="My Test Age Picker" />
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
        />
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

    it('viser bare månedene som kan velges basert på min/maxAlder og valgt år', () => {
      const { container, asFragment } = render(
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

      expect(selectMaanederElement?.querySelectorAll('option')?.length).toBe(8)

      fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
        target: { value: '71' },
      })

      expect(selectMaanederElement?.querySelectorAll('option')?.length).toBe(13)

      fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
        target: { value: '72' },
      })

      expect(selectMaanederElement?.querySelectorAll('option')?.length).toBe(12)
    })
  })

  it('viser feilmelding når error er fylt ut og rikrig aria attributer', () => {
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
        .getByTestId('age-picker-unique-name-aar')
        .getAttribute('aria-invalid')
    ).toBeTruthy()
    expect(
      screen
        .getByTestId('age-picker-unique-name-maaneder')
        .getAttribute('aria-describedby')
    ).toBe('unique-name-error')
    expect(
      screen
        .getByTestId('age-picker-unique-name-maaneder')
        .getAttribute('aria-invalid')
    ).toBeTruthy()
  })

  it('kaller onChange når option velges i år eller måneder, og Select for måneder enables når år er valgt', () => {
    const onChangeMock = vi.fn()
    const { container } = render(
      <AgePicker
        name="unique-name"
        label="My Test Age Picker"
        onChange={onChangeMock}
      />
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
