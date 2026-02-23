import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'

import {
	type BeregningFormData,
	type BeregningParams,
	type BeregningResult,
	type Sivilstand,
	type ValidationErrors,
	defaultBeregningFormData,
} from '../api/beregningTypes'
import {
	useBeregningQuery,
	useDecryptPidQuery,
	usePersonQuery,
} from '../api/queries'
import { getPidFromUrl } from '../utils'
import { useFormValidation } from './BeregningForm/useFormValidation'

interface BeregningContextValue {
	formData: BeregningFormData
	committedParams: BeregningParams | null
	isDirty: boolean
	validationErrors: ValidationErrors
	beregning: BeregningResult | undefined
	isBeregningLoading: boolean
	beregningError: Error | null
	updateFormField: <K extends keyof BeregningFormData>(
		field: K,
		value: BeregningFormData[K]
	) => void
	submitBeregning: () => void
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
	const [formData, setFormData] = useState<BeregningFormData>(() => ({
		...defaultBeregningFormData,
		...(initialSivilstand ? { sivilstand: initialSivilstand } : {}),
	}))
	const [committedParams, setCommittedParams] =
		useState<BeregningParams | null>(null)

	const pid = getPidFromUrl()
	const { data: fnr } = useDecryptPidQuery(pid)
	const { data: person } = usePersonQuery(fnr)

	const { validationErrors, validate, clearError, resetValidationErrors } =
		useFormValidation()

	const updateFormField = useCallback(
		<K extends keyof BeregningFormData>(
			field: K,
			value: BeregningFormData[K]
		) => {
			setFormData((prev) => {
				const next = { ...prev, [field]: value }

				const harPartner =
					next.sivilstand !== null &&
					['GIFT', 'REGISTRERT_PARTNER', 'SAMBOER'].includes(next.sivilstand)
				if (!harPartner) {
					next.epsHarPensjon = null
					next.epsHarInntektOver2G = null
				}
				if (next.epsHarPensjon !== false) {
					next.epsHarInntektOver2G = null
				}
				if (next.harInntektVedSidenAvUttak !== true) {
					next.pensjonsgivendeInntektVedSidenAvUttak = null
					next.alderAarInntektSlutter = null
					next.alderMdInntektSlutter = null
				}
				if (
					field === 'uttaksgrad' &&
					(next.uttaksgrad === null || next.uttaksgrad === 100)
				) {
					next.aarligInntektVsaPensjonGradertUttak = null
					next.alderAarHeltUttak = null
					next.alderMdHeltUttak = null
					next.harInntektVedSidenAvGradertUttak = null
					next.pensjonsgivendeInntektVedSidenAvGradertUttak = null
					next.alderAarInntektGradertSlutter = null
					next.alderMdInntektGradertSlutter = null
				}
				if (next.harInntektVedSidenAvGradertUttak !== true) {
					next.pensjonsgivendeInntektVedSidenAvGradertUttak = null
					next.alderAarInntektGradertSlutter = null
					next.alderMdInntektGradertSlutter = null
				}

				return next
			})
			clearError(field)
		},
		[clearError]
	)

	const submitBeregning = useCallback(() => {
		if (!validate(formData)) return
		setCommittedParams({ ...formData })
	}, [formData, validate])

	const resetForm = useCallback(() => {
		setFormData(defaultBeregningFormData)
		setCommittedParams(null)
		resetValidationErrors()
	}, [resetValidationErrors])

	const {
		data: beregning,
		isFetching: isBeregningLoading,
		error: beregningError,
	} = useBeregningQuery(fnr, person?.foedselsdato, committedParams)

	const isDirty = useMemo(() => {
		if (!committedParams) return false
		return JSON.stringify(formData) !== JSON.stringify(committedParams)
	}, [formData, committedParams])

	return (
		<BeregningContext.Provider
			value={{
				formData,
				committedParams,
				isDirty,
				validationErrors,
				beregning,
				isBeregningLoading,
				beregningError,
				updateFormField,
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
