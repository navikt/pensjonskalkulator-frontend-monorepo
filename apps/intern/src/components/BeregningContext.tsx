import type {
	OmstillingsstoenadOgGjenlevende,
	PersonInternV1,
	Sivilstatus,
	Vedtak,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { calculateUttaksalderAsDate } from '@pensjonskalkulator-frontend-monorepo/utils/alder'
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
	useErApotekerQuery,
	useGrunnbeloepQuery,
	useOmstillingsstoenadQuery,
	usePersonQuery,
	useVedtakQuery,
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
	vedtak: Vedtak | undefined
	initialInntektAar?: number
	initialInntekt?: number
	omstillingsstoenad: OmstillingsstoenadOgGjenlevende | undefined
	erApoteker: boolean
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
	const { data: vedtak } = useVedtakQuery(fnr)
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const { data: omstillingsstoenad } = useOmstillingsstoenadQuery(fnr)
	const { data: erApoteker } = useErApotekerQuery(fnr)

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
		alderAarUttak,
		alderMdUttak,
	] = useWatch({
		control: form.control,
		name: [
			'sivilstatus',
			'epsHarPensjon',
			'harInntektVedSidenAvUttak',
			'uttaksgrad',
			'beregnMedGjenlevenderett',
			'afp',
			'alderAarUttak',
			'alderMdUttak',
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
				erApoteker: !!erApoteker,
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

	const harAlderUttak = alderAarUttak !== null && alderMdUttak !== null
	const forrigeAar = new Date().getFullYear() - 1
	const uttaksAar =
		person?.foedselsdato && harAlderUttak
			? calculateUttaksalderAsDate(
					{ aar: alderAarUttak, maaneder: alderMdUttak },
					person.foedselsdato
				).getFullYear()
			: null
	const harUttakIForrigeAarEllerTidligere =
		uttaksAar !== null && uttaksAar <= forrigeAar
	const harIkkeForrigeAarsInntekt =
		initialInntektAar !== forrigeAar && !harUttakIForrigeAarEllerTidligere

	useEffect(() => {
		if (!harAlderUttak) {
			form.setValue('pensjonsgivendeInntektForrigeAar', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
			form.setValue('pensjonsgivendeInntektFremTilUttak', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
			form.setValue('inntektSisteMaanedFoerUttak', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
			form.setValue('aarsinntektSamtidigMedAfp', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
		}
	}, [harAlderUttak, form])

	useEffect(() => {
		if (!harIkkeForrigeAarsInntekt) {
			form.setValue('pensjonsgivendeInntektForrigeAar', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
		}
	}, [harIkkeForrigeAarsInntekt, form])

	const submitBeregning = useCallback(() => {
		const values = cloneBeregningParams(form.getValues())
		setPendingBeregning(values)
		form.reset(values, { keepValues: true })
	}, [form])

	const resetForm = useCallback(() => {
		const { endringAP, endringAfpPrivat, vedtakInfoAvdoed } = form.getValues()

		form.reset({
			...defaultBeregningFormData,
			...(person?.sivilstatus ? { sivilstatus: person.sivilstatus } : {}),
			...(initialSivilstatus ? { sivilstatus: initialSivilstatus } : {}),
			...{
				...(initialInntekt !== undefined
					? { aarligInntektFoerUttakBeloep: initialInntekt }
					: {}),
			},
			endringAP,
			endringAfpPrivat,
			vedtakInfoAvdoed,
		})
		setPendingBeregning(null)
	}, [form, person?.sivilstatus, initialSivilstatus, initialInntekt])

	const pendingRequest = pendingBeregning
		? mapBeregningParamsToRequest(
				pendingBeregning,
				!!erApoteker,
				person,
				grunnbeloep,
				vedtak
			)
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
					vedtak,
					initialInntektAar,
					initialInntekt,
					omstillingsstoenad,
					erApoteker: !!erApoteker,
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
