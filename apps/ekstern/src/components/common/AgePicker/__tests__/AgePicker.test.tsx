import { describe, it, vi } from 'vitest'

import { AgePicker } from '..'
import { render, screen, fireEvent } from '@/test-utils'

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
      const optionMaanederElements =
        selectMaanederElement?.querySelectorAll('option')
      expect(optionMaanederElements?.length).toBe(13)
      expect(optionMaanederElements?.[0].value).toBe('')
      expect(optionMaanederElements?.[1].value).toBe('0')
      expect(optionMaanederElements?.[12].value).toBe('11')
    })

    it('disabler månedene som ikke kan velges basert på min/maxAlder og valgt år', () => {
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
      const optionMaanederElements =
        selectMaanederElement?.querySelectorAll('option')
      expect(optionMaanederElements?.length).toBe(13)
      expect(optionMaanederElements).toMatchSnapshot()

      fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
        target: { value: '70' },
      })

      const optionMaanederElementsDisabledMin = Array.from(
        selectMaanederElement?.querySelectorAll(
          'option'
        ) as NodeListOf<HTMLOptionElement>
      ).filter((option) => option.disabled)
      expect(optionMaanederElementsDisabledMin?.length).toBe(6)

      fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
        target: { value: '72' },
      })

      const optionMaanederElementsDisabledMax = Array.from(
        selectMaanederElement?.querySelectorAll(
          'option'
        ) as NodeListOf<HTMLOptionElement>
      ).filter((option) => option.disabled)
      expect(optionMaanederElementsDisabledMax?.length).toBe(2)
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

  it('kaller onChange når option velges i år eller måneder', () => {
    const onChangeMock = vi.fn()
    render(
      <AgePicker
        name="unique-name"
        label="My Test Age Picker"
        onChange={onChangeMock}
      />
    )
    fireEvent.change(screen.getByTestId('age-picker-unique-name-aar'), {
      target: { value: '72' },
    })
    expect(onChangeMock).toHaveBeenCalledTimes(1)

    fireEvent.change(screen.getByTestId('age-picker-unique-name-maaneder'), {
      target: { value: '5' },
    })
    expect(onChangeMock).toHaveBeenCalledTimes(2)
  })
})
