import { useCallback, useEffect, useRef } from 'react'

import { parseStrictEndUserDate } from '../../utils/dates'

type UseOppholdFokusArgs = {
	activeIndex: number | null
	startdato: string
}

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

export function useOppholdFokus({
	activeIndex,
	startdato,
}: UseOppholdFokusArgs) {
	const startdatoWrapperRef = useRef<HTMLDivElement>(null)
	const sluttdatoInputRef = useRef<HTMLInputElement>(null)
	const previousStartdatoRef = useRef(startdato)

	const [leggTilNyttOppholdRef, fokuserLeggTilNyttOpphold] =
		useFokusVedMount<HTMLButtonElement>()
	const [landSelectRef, fokuserLandSelect] =
		useFokusVedMount<HTMLSelectElement>()

	useEffect(() => {
		const previousStartdato = previousStartdatoRef.current
		previousStartdatoRef.current = startdato

		if (activeIndex === null) return
		if (previousStartdato === startdato) return
		if (!parseStrictEndUserDate(startdato)) return
		// Bare flytt fokus når brukeren selv fyller ut startdato
		if (!startdatoWrapperRef.current?.contains(document.activeElement)) return

		sluttdatoInputRef.current?.focus()
	}, [activeIndex, startdato])

	return {
		startdatoWrapperRef,
		sluttdatoInputRef,
		leggTilNyttOppholdRef,
		landSelectRef,
		fokuserLeggTilNyttOpphold,
		fokuserLandSelect,
	}
}
