import type {
	PersonInternV1,
	Sivilstatus,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import {
	FormProvider,
	type UseFormReturn,
	useForm,
	useWatch,
} from 'react-hook-form'

import {
	type BeregningFormData,
	type BeregningParams,
	type BeregningResult,
	defaultBeregningFormData,
} from '../api/beregningTypes'
import { isHarPartner } from '../api/formConditions'
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
	person: PersonInternV1 | undefined
	submitBeregning: () => void
	resetForm: () => void
}

const BeregningContext = createContext<BeregningContextValue | null>(null)

interface BeregningProviderProps {
	children: ReactNode
	initialSivilstatus: Sivilstatus | null
}

export function BeregningProvider({
	children,
	initialSivilstatus,
}: BeregningProviderProps) {
	const form = useForm<BeregningFormData>({
		defaultValues: {
			...defaultBeregningFormData,
			...(initialSivilstatus ? { sivilstatus: initialSivilstatus } : {}),
		},
		mode: 'onChange',
	})

	// Reset dirty state on mount to ensure clean initial state
	useEffect(() => {
		form.reset(
			{
				...defaultBeregningFormData,
				...(initialSivilstatus ? { sivilstatus: initialSivilstatus } : {}),
			},
			{ keepValues: true, keepDirty: false }
		)
	}, [])

	const [aktivBeregning, setAktivBeregning] = useState<BeregningParams | null>(
		null
	)
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const pid = getPidFromUrl()
	const { data: fnr } = useDecryptPidQuery(pid)
	const { data: person } = usePersonQuery(fnr)

	const { isDirty: formIsDirty } = form.formState
	const showDirtyWarning = hasSubmitted && formIsDirty

	const [
		sivilstatus,
		epsHarPensjon,
		harInntektVedSidenAvUttak,
		uttaksgrad,
		harInntektVedSidenAvGradertUttak,
	] = useWatch({
		control: form.control,
		name: [
			'sivilstatus',
			'epsHarPensjon',
			'harInntektVedSidenAvUttak',
			'uttaksgrad',
			'harInntektVedSidenAvGradertUttak',
		] as const,
	})

	useEffect(() => {
		if (!isHarPartner(sivilstatus)) {
			form.setValue('epsHarPensjon', null, { shouldDirty: false })
			form.setValue('epsHarInntektOver2G', null, { shouldDirty: false })
		}
	}, [sivilstatus, form])

	useEffect(() => {
		if (epsHarPensjon !== false) {
			form.setValue('epsHarInntektOver2G', null, { shouldDirty: false })
		}
	}, [epsHarPensjon, form])

	useEffect(() => {
		if (harInntektVedSidenAvUttak !== true) {
			form.setValue('pensjonsgivendeInntektVedSidenAvUttak', null, {
				shouldDirty: false,
			})
			form.setValue('alderAarInntektSlutter', null, { shouldDirty: false })
			form.setValue('alderMdInntektSlutter', null, { shouldDirty: false })
		}
	}, [harInntektVedSidenAvUttak, form])

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
	}, [uttaksgrad, form])

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
	}, [harInntektVedSidenAvGradertUttak, form])

	const submitBeregning = useCallback(() => {
		const values = form.getValues()
		setAktivBeregning({ ...values })
		setHasSubmitted(true)
		// Reset form to make these submitted values the new baseline
		// This makes formIsDirty = false after successful submission
		form.reset(values, { keepValues: true })
	}, [form])

	const resetForm = useCallback(() => {
		form.reset(defaultBeregningFormData)
		setAktivBeregning(null)
		setHasSubmitted(false)
	}, [form])

	const {
		data: beregning,
		isFetching: isBeregningLoading,
		error: beregningError,
	} = useBeregningQuery(fnr, person?.foedselsdato, aktivBeregning)

	return (
		<FormProvider {...form}>
			<BeregningContext.Provider
				value={{
					form,
					aktivBeregning,
					isDirty: showDirtyWarning,
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
		</FormProvider>
	)
}

export function useBeregningContext() {
	const context = useContext(BeregningContext)
	if (!context) {
		throw new Error('useBeregningContext must be used within BeregningProvider')
	}
	return context
}
