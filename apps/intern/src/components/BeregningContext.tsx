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
	type ValidationErrors,
	defaultBeregningFormData,
} from '../api/beregningTypes'
import { useFormValidation } from './BeregningForm/useFormValidation'

interface BeregningContextValue {
	formData: BeregningFormData
	committedParams: BeregningParams | null
	isDirty: boolean
	validationErrors: ValidationErrors
	updateFormField: <K extends keyof BeregningFormData>(
		field: K,
		value: BeregningFormData[K]
	) => void
	submitBeregning: () => void
	resetForm: () => void
}

const BeregningContext = createContext<BeregningContextValue | null>(null)

export function BeregningProvider({ children }: { children: ReactNode }) {
	const [formData, setFormData] = useState<BeregningFormData>(
		defaultBeregningFormData
	)
	const [committedParams, setCommittedParams] =
		useState<BeregningParams | null>(null)

	const { validationErrors, validate, clearError, resetValidationErrors } =
		useFormValidation()

	const updateFormField = useCallback(
		<K extends keyof BeregningFormData>(
			field: K,
			value: BeregningFormData[K]
		) => {
			setFormData((prev) => ({ ...prev, [field]: value }))
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
