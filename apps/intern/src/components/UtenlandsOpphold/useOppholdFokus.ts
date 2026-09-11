import { useEffect, useRef, useState } from 'react'

import { parseStrictEndUserDate } from '../../utils/dates'

type UseOppholdFokusArgs = {
	activeIndex: number | null
	startdato: string
	isEditorClosed: boolean
	hasOpphold: boolean
}

export function useOppholdFokus({
	activeIndex,
	startdato,
	isEditorClosed,
	hasOpphold,
}: UseOppholdFokusArgs) {
	const startdatoWrapperRef = useRef<HTMLDivElement>(null)
	const sluttdatoInputRef = useRef<HTMLInputElement>(null)
	const leggTilNyttOppholdRef = useRef<HTMLButtonElement>(null)
	const landSelectRef = useRef<HTMLSelectElement>(null)
	const previousStartdatoRef = useRef(startdato)
	const [skalFokusereLeggTil, setSkalFokusereLeggTil] = useState(false)
	const [skalFokusereLand, setSkalFokusereLand] = useState(false)

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

	useEffect(() => {
		if (!skalFokusereLeggTil) return
		if (!isEditorClosed || !hasOpphold) return

		leggTilNyttOppholdRef.current?.focus()
		setSkalFokusereLeggTil(false)
	}, [hasOpphold, isEditorClosed, skalFokusereLeggTil])

	useEffect(() => {
		if (!skalFokusereLand) return
		if (activeIndex === null) return

		landSelectRef.current?.focus()
		setSkalFokusereLand(false)
	}, [activeIndex, skalFokusereLand])

	return {
		startdatoWrapperRef,
		sluttdatoInputRef,
		leggTilNyttOppholdRef,
		landSelectRef,
		fokuserLeggTilNyttOpphold: () => setSkalFokusereLeggTil(true),
		fokuserLandSelect: () => setSkalFokusereLand(true),
	}
}
