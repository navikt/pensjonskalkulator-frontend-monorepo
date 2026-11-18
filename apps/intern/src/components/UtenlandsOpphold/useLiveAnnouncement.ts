import { useCallback, useEffect, useRef, useState } from 'react'

const ANNOUNCEMENT_DELAY_MS = 100

export function useLiveAnnouncement() {
	const [message, setMessage] = useState('')
	const timeoutRef = useRef<number | undefined>(undefined)

	const clear = useCallback(() => {
		window.clearTimeout(timeoutRef.current)
		setMessage('')
	}, [])

	// Tømmer først i egen render, slik at like meldinger også gir en DOM-endring som leses opp
	const announce = useCallback((nextMessage: string) => {
		window.clearTimeout(timeoutRef.current)
		setMessage('')
		timeoutRef.current = window.setTimeout(
			() => setMessage(nextMessage),
			ANNOUNCEMENT_DELAY_MS
		)
	}, [])

	useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

	return { message, announce, clear }
}
