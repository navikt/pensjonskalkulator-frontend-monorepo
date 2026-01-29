import { describe, it } from 'vitest'

import { render, screen, waitFor } from '@/test-utils'

import { StepKalkulatorVirkerIkke } from '..'

describe('Step Kalkulator Virker Ikke', () => {
  it('informasjon om feil vises', async () => {
    render(<StepKalkulatorVirkerIkke />)
    await waitFor(() => {
      expect(screen.getByTestId('error-step-unexpected')).toBeInTheDocument()
    })
  })
})
