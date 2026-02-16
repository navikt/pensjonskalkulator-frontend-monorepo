import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react'

import {
	type BeregningFormData,
	type BeregningParams,
	defaultBeregningFormData,
} from '../api/beregningTypes'

interface BeregningContextValue {
	formData: BeregningFormData
	committedParams: BeregningParams | null
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

	const updateFormField = useCallback(
		<K extends keyof BeregningFormData>(
			field: K,
			value: BeregningFormData[K]
		) => {
			setFormData((prev) => ({ ...prev, [field]: value }))
		},
		[]
	)

	const submitBeregning = useCallback(() => {
		setCommittedParams({ ...formData })
	}, [formData])

	const resetForm = useCallback(() => {
		setFormData(defaultBeregningFormData)
		setCommittedParams(null)
	}, [])

	return (
		<BeregningContext.Provider
			value={{
				formData,
				committedParams,
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
