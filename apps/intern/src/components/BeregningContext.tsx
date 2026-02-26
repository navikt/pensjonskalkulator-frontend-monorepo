import type { Person } from '@pensjonskalkulator-frontend-monorepo/types'
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'

import {
	type BeregningFormData,
	type BeregningParams,
	type BeregningResult,
	type Sivilstand,
	defaultBeregningFormData,
} from '../api/beregningTypes'
import {
	useBeregningQuery,
	useDecryptPidQuery,
	usePersonQuery,
} from '../api/queries'
import { getPidFromUrl } from '../utils'

interface BeregningContextValue {
	form: UseFormReturn<BeregningFormData>
	aktivBeregning: BeregningParams | null
	isDirty: boolean
	beregning: BeregningResult | undefined
	isBeregningLoading: boolean
	beregningError: Error | null
	person: Person | undefined
	submitBeregning: () => Promise<void>
	resetForm: () => void
}

const BeregningContext = createContext<BeregningContextValue | null>(null)

interface BeregningProviderProps {
	children: ReactNode
	initialSivilstand?: Sivilstand
}

export function BeregningProvider({
	children,
	initialSivilstand,
}: BeregningProviderProps) {
	const form = useForm<BeregningFormData>({
		defaultValues: {
			...defaultBeregningFormData,
			...(initialSivilstand ? { sivilstand: initialSivilstand } : {}),
		},
		mode: 'onChange',
	})

	const [aktivBeregning, setAktivBeregning] = useState<BeregningParams | null>(
		null
	)

	const pid = getPidFromUrl()
	const { data: fnr } = useDecryptPidQuery(pid)
	const { data: person } = usePersonQuery(fnr)

	const { isDirty } = form.formState
	const sivilstand = form.watch('sivilstand')
	const epsHarPensjon = form.watch('epsHarPensjon')
	const harInntektVedSidenAvUttak = form.watch('harInntektVedSidenAvUttak')
	const uttaksgrad = form.watch('uttaksgrad')
	const harInntektVedSidenAvGradertUttak = form.watch(
		'harInntektVedSidenAvGradertUttak'
	)

	useEffect(() => {
		const harPartner =
			sivilstand !== null &&
			['GIFT', 'REGISTRERT_PARTNER', 'SAMBOER'].includes(sivilstand)

		if (!harPartner) {
			form.setValue('epsHarPensjon', null, { shouldDirty: false })
			form.setValue('epsHarInntektOver2G', null, { shouldDirty: false })
		}
	}, [sivilstand])

	useEffect(() => {
		if (epsHarPensjon !== false) {
			form.setValue('epsHarInntektOver2G', null, { shouldDirty: false })
		}
	}, [epsHarPensjon])

	useEffect(() => {
		if (harInntektVedSidenAvUttak !== true) {
			form.setValue('pensjonsgivendeInntektVedSidenAvUttak', null, {
				shouldDirty: false,
			})
			form.setValue('alderAarInntektSlutter', null, { shouldDirty: false })
			form.setValue('alderMdInntektSlutter', null, { shouldDirty: false })
		}
	}, [harInntektVedSidenAvUttak])

	useEffect(() => {
		if (uttaksgrad === null || uttaksgrad === 100) {
			form.setValue('aarligInntektVsaPensjonGradertUttak', null, {
				shouldDirty: false,
			})
			form.setValue('alderAarHeltUttak', null, { shouldDirty: false })
			form.setValue('alderMdHeltUttak', null, { shouldDirty: false })
			form.setValue('harInntektVedSidenAvGradertUttak', null, {
				shouldDirty: false,
			})
			form.setValue('pensjonsgivendeInntektVedSidenAvGradertUttak', null, {
				shouldDirty: false,
			})
			form.setValue('alderAarInntektGradertSlutter', null, {
				shouldDirty: false,
			})
			form.setValue('alderMdInntektGradertSlutter', null, {
				shouldDirty: false,
			})
		}
	}, [uttaksgrad])

	useEffect(() => {
		if (harInntektVedSidenAvGradertUttak !== true) {
			form.setValue('pensjonsgivendeInntektVedSidenAvGradertUttak', null, {
				shouldDirty: false,
			})
			form.setValue('alderAarInntektGradertSlutter', null, {
				shouldDirty: false,
			})
			form.setValue('alderMdInntektGradertSlutter', null, {
				shouldDirty: false,
			})
		}
	}, [harInntektVedSidenAvGradertUttak])

	const submitBeregning = useCallback(async () => {
		const isValid = await form.trigger()
		if (!isValid) return
		const values = form.getValues()
		setAktivBeregning({ ...values })
	}, [form])

	const resetForm = useCallback(() => {
		form.reset(defaultBeregningFormData)
		setAktivBeregning(null)
	}, [form])

	const {
		data: beregning,
		isFetching: isBeregningLoading,
		error: beregningError,
	} = useBeregningQuery(fnr, person?.foedselsdato, aktivBeregning)

	return (
		<BeregningContext.Provider
			value={{
				form,
				aktivBeregning,
				isDirty,
				person,
				beregning,
				isBeregningLoading,
				beregningError,
				submitBeregning,
				resetForm,
			}}
		>
			{children}
		</BeregningContext.Provider>
	)
}

export function useBeregningContext() {
	const context = useContext(BeregningContext)
	if (!context) {
		throw new Error('useBeregningContext must be used within BeregningProvider')
	}
	return context
}
