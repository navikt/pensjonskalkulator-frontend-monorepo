import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { App } from './App'

const { darkModeToggle } = vi.hoisted(() => ({
	darkModeToggle: { enabled: true },
}))

vi.mock('./SanityProvider.tsx', () => ({
	SanityProvider: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('./PersonInfo.tsx', () => ({
	PersonInfo: () => <div>Personopplysninger</div>,
}))

vi.mock('./api/queries.ts', () => ({
	useDecryptPidQuery: () => ({}),
	useEnheterQuery: () => ({}),
	useErApotekerQuery: () => ({}),
	useFeatureToggleQuery: () => ({ data: darkModeToggle }),
	useInntektQuery: () => ({}),
	useInternsimulatorLagreBrevButtonQuery: () => ({}),
	useOmstillingsstoenadQuery: () => ({}),
	usePersonQuery: () => ({}),
	useVedtakQuery: () => ({}),
}))

describe('App color theme', () => {
	beforeEach(() => {
		darkModeToggle.enabled = true
		localStorage.clear()
		window.history.replaceState({}, '', '/')
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
	})

	afterEach(() => {
		cleanup()
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		document.documentElement.classList.remove('light', 'dark')
	})

	test('switches modes immediately and retains the choice after remounting', () => {
		const { unmount } = render(<App />)
		const toggle = screen.getByRole('checkbox', { name: 'Mørkt tema' })

		expect(toggle).not.toBeChecked()
		expect(document.documentElement).toHaveClass('light')
		fireEvent.click(toggle)
		expect(toggle).toBeChecked()
		expect(document.documentElement).toHaveClass('dark')
		expect(document.documentElement).not.toHaveClass('light')
		expect(localStorage.getItem('intern-color-theme')).toBe('dark')

		unmount()
		render(<App />)
		const restoredToggle = screen.getByRole('checkbox', { name: 'Mørkt tema' })
		expect(restoredToggle).toBeChecked()
		fireEvent.click(restoredToggle)
		expect(document.documentElement).toHaveClass('light')
		expect(document.documentElement).not.toHaveClass('dark')
		expect(localStorage.getItem('intern-color-theme')).toBe('light')
	})

	test('uses the OS dark preference when no choice is saved', () => {
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
		render(<App />)

		expect(screen.getByRole('checkbox', { name: 'Mørkt tema' })).toBeChecked()
		expect(document.documentElement).toHaveClass('dark')
	})

	test('honors a saved light preference over the OS dark preference', () => {
		localStorage.setItem('intern-color-theme', 'light')
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
		render(<App />)

		expect(
			screen.getByRole('checkbox', { name: 'Mørkt tema' })
		).not.toBeChecked()
		expect(document.documentElement).toHaveClass('light')
	})

	test('ignores invalid saved values', () => {
		localStorage.setItem('intern-color-theme', 'invalid')
		render(<App />)

		expect(document.documentElement).toHaveClass('light')
	})

	test('still toggles when browser storage is unavailable', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('Storage unavailable')
		})
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('Storage unavailable')
		})
		render(<App />)
		fireEvent.click(screen.getByRole('checkbox', { name: 'Mørkt tema' }))

		expect(document.documentElement).toHaveClass('dark')
	})

	test('forces light mode and hides the toggle while its feature flag is off', () => {
		darkModeToggle.enabled = false
		localStorage.setItem('intern-color-theme', 'dark')
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

		render(<App />)

		expect(
			screen.queryByRole('checkbox', { name: 'Mørkt tema' })
		).not.toBeInTheDocument()
		expect(document.documentElement).toHaveClass('light')
		expect(document.documentElement).not.toHaveClass('dark')
		expect(localStorage.getItem('intern-color-theme')).toBe('dark')
	})
})
