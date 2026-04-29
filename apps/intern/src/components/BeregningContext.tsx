import type {
	LoependeVedtak,
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
import { harPartner, showAfpOffentligFields } from '../api/formConditions'
import { mapBeregningParamsToRequest } from '../api/mapBeregningParams'
import {
	useBeregningQuery,
	useDecryptPidQuery,
	useGrunnbeloepQuery,
	useLoependeVedtakQuery,
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
	fnr: string | undefined
	person: PersonInternV1 | undefined
	loependeVedtak: LoependeVedtak | undefined
	initialInntektAar: number | undefined
	submitBeregning: () => void
	resetForm: () => void
}

const BeregningContext = createContext<BeregningContextValue | null>(null)

interface BeregningProviderProps {
	children: ReactNode
	initialInntekt?: number
	initialInntektAar?: number
	initialSivilstatus?: Sivilstatus
}

const cloneBeregningParams = (values: BeregningFormData): BeregningParams =>
	structuredClone(values)

export function BeregningProvider({
	children,
	initialInntekt,
	initialInntektAar,
	initialSivilstatus,
}: BeregningProviderProps) {
	const form = useForm<BeregningFormData>({
		defaultValues: {
			...defaultBeregningFormData,
			...(initialInntekt !== undefined
				? { aarligInntektFoerUttakBeloep: initialInntekt }
				: {}),
			...(initialSivilstatus ? { sivilstatus: initialSivilstatus } : {}),
		},
		mode: 'onChange',
	})

	// Reset dirty state on mount to ensure clean initial state
	useEffect(() => {
		form.reset(
			{
				...defaultBeregningFormData,
				...(initialInntekt !== undefined
					? { aarligInntektFoerUttakBeloep: initialInntekt }
					: {}),
				...(initialSivilstatus ? { sivilstatus: initialSivilstatus } : {}),
			},
			{ keepValues: true, keepDirty: false }
		)
	}, [])

	const [aktivBeregning, setAktivBeregning] = useState<BeregningParams | null>(
		null
	)
	const [pendingBeregning, setPendingBeregning] =
		useState<BeregningParams | null>(null)

	const pid = getPidFromUrl()
	const { data: fnr } = useDecryptPidQuery(pid)
	const { data: person } = usePersonQuery(fnr)
	const { data: loependeVedtak } = useLoependeVedtakQuery(fnr)
	const { data: grunnbeloep } = useGrunnbeloepQuery()

	const { isDirty: formIsDirty } = form.formState
	const isDirty =
		(!!pendingBeregning && formIsDirty) ||
		(!!aktivBeregning && !pendingBeregning)

	const [
		sivilstatus,
		epsHarPensjon,
		harInntektVedSidenAvUttak,
		uttaksgrad,
		beregnMedGjenlevenderett,
		afp,
	] = useWatch({
		control: form.control,
		name: [
			'sivilstatus',
			'epsHarPensjon',
			'harInntektVedSidenAvUttak',
			'uttaksgrad',
			'beregnMedGjenlevenderett',
			'afp',
		] as const,
	})

	useEffect(() => {
		if (person?.sivilstatus) {
			form.setValue('sivilstatus', person.sivilstatus, { shouldDirty: false })
		}
	}, [person?.sivilstatus, form])

	useEffect(() => {
		if (beregnMedGjenlevenderett) {
			form.setValue('afp', undefined, { shouldDirty: false })
		} else {
			form.setValue('bakgrunnForBrukAvOpplysningerOmEPS', null, {
				shouldDirty: false,
			})
		}
	}, [beregnMedGjenlevenderett, form])

	useEffect(() => {
		if (
			!showAfpOffentligFields({
				afp,
				foedselsdato: person?.foedselsdato,
			})
		) {
			form.setValue('inntektSisteMaanedFoerUttak', null, {
				shouldDirty: false,
			})
			form.setValue('aarsinntektSamtidigMedAfp', null, {
				shouldDirty: false,
			})
		}
	}, [afp, person?.foedselsdato, form])

	useEffect(() => {
		if (!harPartner(sivilstatus)) {
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
		if (uttaksgrad === null) {
			form.setValue('harInntektVedSidenAvUttak', null, {
				shouldDirty: false,
			})
		}
	}, [uttaksgrad, form])

	useEffect(() => {
		if (uttaksgrad === null || uttaksgrad === 100) {
			form.setValue('aarligInntektVsaPensjonGradertUttak', null, {
				shouldDirty: false,
			})
			form.setValue('alderAarHeltUttak', null, { shouldDirty: false })
			form.setValue('alderMdHeltUttak', null, { shouldDirty: false })
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

	const submitBeregning = useCallback(() => {
		const values = cloneBeregningParams(form.getValues())
		setPendingBeregning(values)
		form.reset(values, { keepValues: true })
	}, [form])

	const resetForm = useCallback(() => {
		form.reset({
			...defaultBeregningFormData,
			...(person?.sivilstatus ? { sivilstatus: person.sivilstatus } : {}),
			...(initialSivilstatus ? { sivilstatus: initialSivilstatus } : {}),
		})
		setPendingBeregning(null)
	}, [form, person?.sivilstatus, initialSivilstatus])

	const pendingRequest = pendingBeregning
		? mapBeregningParamsToRequest(pendingBeregning, person, grunnbeloep)
		: null

	const {
		data: beregning,
		isFetching: isBeregningLoading,
		error: beregningError,
	} = useBeregningQuery(fnr, pendingRequest)

	useEffect(() => {
		if (!isBeregningLoading && pendingBeregning) {
			setAktivBeregning(cloneBeregningParams(pendingBeregning))
		}
	}, [isBeregningLoading, pendingBeregning])

	return (
		<FormProvider {...form}>
			<BeregningContext.Provider
				value={{
					form,
					aktivBeregning,
					isDirty,
					fnr,
					person,
					beregning,
					isBeregningLoading,
					beregningError,
					loependeVedtak,
					initialInntektAar,
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
