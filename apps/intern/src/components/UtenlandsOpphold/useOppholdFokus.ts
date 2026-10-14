import { useCallback, useRef } from 'react'

function useFokusVedMount<T extends HTMLElement>() {
	const nodeRef = useRef<T | null>(null)
	const skalFokusereRef = useRef(false)

	const ref = useCallback((node: T | null) => {
		nodeRef.current = node
		if (node && skalFokusereRef.current) {
			skalFokusereRef.current = false
			node.focus()
		}
	}, [])

	const fokuser = useCallback(() => {
		if (nodeRef.current) {
			nodeRef.current.focus()
			return
		}
		// Elementet mountes først ved neste render
		skalFokusereRef.current = true
	}, [])

	return [ref, fokuser] as const
}

export function useOppholdFokus() {
	const sluttdatoInputRef = useRef<HTMLInputElement>(null)

	const [leggTilNyttOppholdRef, fokuserLeggTilNyttOpphold] =
		useFokusVedMount<HTMLButtonElement>()
	const [landSelectRef, fokuserLandSelect] =
		useFokusVedMount<HTMLInputElement>()

	// Kalenderpanelet flytter fokus til kalenderknappen når det lukkes, så vi venter til det er ferdig
	const fokuserSluttdato = useCallback(() => {
		window.setTimeout(() => sluttdatoInputRef.current?.focus(), 0)
	}, [])

	return {
		sluttdatoInputRef,
		leggTilNyttOppholdRef,
		landSelectRef,
		fokuserLeggTilNyttOpphold,
		fokuserLandSelect,
		fokuserSluttdato,
	}
}
