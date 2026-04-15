import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'

import {
	Button,
	Checkbox,
	CopyButton,
	HStack,
	Tooltip,
	VStack,
} from '@navikt/ds-react'

import { parseEndUserDate } from '../../utils/dates'
import { useBeregningContext } from '../BeregningContext'
import { RHFDatePicker } from '../BeregningForm/rhf-adapters/RHFDatePicker'
import { RHFRadio } from '../BeregningForm/rhf-adapters/RHFRadio'
import { RHFSelect } from '../BeregningForm/rhf-adapters/RHFSelect'
import { Divider } from '../Divider/Divider'
import { OppholdListItem } from './OppholdListItem'
import type { OppholdField, OppholdValues } from './types'
import {
	emptyOpphold,
	formatFoedselsdato,
	getOppholdCopyText,
	getOppholdFieldName,
	getOppholdValidationMessage,
	isAvtaleland,
	landList,
	validateOpphold,
} from './utils'
import type {
	UtenlandsoppholdValidationField,
	UtenlandsoppholdValidationResult,
} from './utils'

import styles from './UtenlandsOpphold.module.css'

type UtenlandsOppholdProps = {
	onSubmitDisabledChange?: (isDisabled: boolean) => void
}

export const UtenlandsOpphold = ({
	onSubmitDisabledChange,
}: UtenlandsOppholdProps) => {
	const { form, person } = useBeregningContext()
	const { control } = form
	const [harOppholdUtenforNorge] = useWatch({
		control,
		name: ['harOppholdUtenforNorge'] as const,
	})

	const { fields, remove, replace, update } = useFieldArray({
		control,
		name: 'utenlandsOpphold',
	})

	const [activeIndex, setActiveIndex] = useState<number | null>(null)
	const mode =
		activeIndex === null
			? 'closed'
			: activeIndex < fields.length
				? 'edit'
				: 'new'

	const watchedIndex = activeIndex ?? 0

	const activeFieldName = <T extends OppholdField>(field: T) =>
		getOppholdFieldName(watchedIndex, field)

	const currentLand = useWatch({
		control,
		name: activeFieldName('landkode'),
	})

	const startdato = useWatch({
		control,
		name: activeFieldName('fom'),
	})

	const sluttdato = useWatch({
		control,
		name: activeFieldName('tom'),
	})

	const brukFoedselsdato = useWatch({
		control,
		name: activeFieldName('brukFoedselsdato'),
	})

	const arbeidetUtenlands = useWatch({
		control,
		name: activeFieldName('arbeidetUtenlands'),
	})

	const landOptions = currentLand
		? landList
		: [{ landkode: '', navn: '' }, ...landList]

	const foedselsdato = formatFoedselsdato(person?.foedselsdato)
	const foedselsdatoDate = parseEndUserDate(foedselsdato)
	const startdatoDate = parseEndUserDate(startdato)

	const previousLandRef = useRef<string | undefined>(undefined)
	const originalOppholdRef = useRef<OppholdValues | null>(null)
	const reopenEmptyOppholdRef = useRef(false)

	const getOppholdValues = (index: number): OppholdValues => ({
		landkode: form.getValues(getOppholdFieldName(index, 'landkode')),
		arbeidetUtenlands: form.getValues(
			getOppholdFieldName(index, 'arbeidetUtenlands')
		),
		fom: form.getValues(getOppholdFieldName(index, 'fom')),
		tom: form.getValues(getOppholdFieldName(index, 'tom')),
		brukFoedselsdato: form.getValues(
			getOppholdFieldName(index, 'brukFoedselsdato')
		),
	})

	const copyText = getOppholdCopyText(
		fields.map((_, index) => getOppholdValues(index))
	)
	const savedOpphold = fields.map((_, index) => getOppholdValues(index))
	const hasOpphold = fields.length > 0
	const isSubmitDisabled =
		harOppholdUtenforNorge === true && (activeIndex !== null || !hasOpphold)

	const setOppholdValues = (index: number, values: OppholdValues) => {
		form.setValue(getOppholdFieldName(index, 'landkode'), values.landkode)
		form.setValue(
			getOppholdFieldName(index, 'arbeidetUtenlands'),
			values.arbeidetUtenlands
		)
		form.setValue(getOppholdFieldName(index, 'fom'), values.fom)
		form.setValue(getOppholdFieldName(index, 'tom'), values.tom)
		form.setValue(
			getOppholdFieldName(index, 'brukFoedselsdato'),
			values.brukFoedselsdato
		)
	}

	const getOppholdErrorFields = (index: number) =>
		[
			getOppholdFieldName(index, 'landkode'),
			getOppholdFieldName(index, 'arbeidetUtenlands'),
			getOppholdFieldName(index, 'fom'),
			getOppholdFieldName(index, 'tom'),
		] as const

	const clearOppholdErrors = (index: number) => {
		form.clearErrors(getOppholdErrorFields(index))
	}

	const getValidationPeriods = () =>
		fields.map((_, index) => ({
			id: String(index),
			landkode: form.getValues(getOppholdFieldName(index, 'landkode')),
			arbeidetUtenlands: form.getValues(
				getOppholdFieldName(index, 'arbeidetUtenlands')
			),
			fom: form.getValues(getOppholdFieldName(index, 'fom')),
			tom: form.getValues(getOppholdFieldName(index, 'tom')) || undefined,
		}))

	const showOppholdErrors = (
		index: number,
		validationResult: UtenlandsoppholdValidationResult
	) => {
		for (const field of Object.keys(
			validationResult.errors
		) as UtenlandsoppholdValidationField[]) {
			const code = validationResult.errors[field]

			if (!code) continue

			form.setError(getOppholdFieldName(index, field), {
				message: getOppholdValidationMessage(
					code,
					field,
					validationResult.overlap
				),
			})
		}
	}

	const validateCurrentOpphold = (index: number, values: OppholdValues) => {
		clearOppholdErrors(index)

		const validationResult = validateOpphold({
			opphold: values,
			foedselsdato: person?.foedselsdato,
			utenlandsperiodeId: mode === 'edit' ? String(index) : undefined,
			utenlandsperioder: getValidationPeriods(),
		})

		if (validationResult.isValid) {
			return true
		}

		showOppholdErrors(index, validationResult)

		return false
	}

	const openOppholdEditor = (index: number, values: OppholdValues) => {
		previousLandRef.current = values.landkode || undefined
		originalOppholdRef.current = index < fields.length ? values : null
		clearOppholdErrors(index)
		setOppholdValues(index, values)
		setActiveIndex(index)
	}

	const closeOppholdEditor = () => {
		if (activeIndex !== null) {
			clearOppholdErrors(activeIndex)
		}
		previousLandRef.current = undefined
		originalOppholdRef.current = null
		setActiveIndex(null)
	}

	const openNewOpphold = () => {
		openOppholdEditor(fields.length, emptyOpphold)
	}

	const saveOpphold = () => {
		if (activeIndex === null) return

		const opphold = getOppholdValues(activeIndex)

		if (!validateCurrentOpphold(activeIndex, opphold)) {
			return
		}

		if (mode === 'edit') {
			update(activeIndex, opphold)
		} else {
			replace([...savedOpphold, opphold])
		}

		closeOppholdEditor()
	}

	useEffect(() => {
		if (
			reopenEmptyOppholdRef.current &&
			harOppholdUtenforNorge &&
			fields.length === 0 &&
			activeIndex === null
		) {
			reopenEmptyOppholdRef.current = false
			openNewOpphold()
			return
		}

		if (!harOppholdUtenforNorge) {
			reopenEmptyOppholdRef.current = false
			closeOppholdEditor()
			return
		}
		if (fields.length === 0 && activeIndex === null) {
			openNewOpphold()
		}
	}, [activeIndex, fields.length, harOppholdUtenforNorge])

	useEffect(() => {
		if (activeIndex === null) return
		if (previousLandRef.current === undefined) {
			previousLandRef.current = currentLand
			return
		}
		if (previousLandRef.current === currentLand) return
		previousLandRef.current = currentLand
		form.setValue(
			getOppholdFieldName(activeIndex, 'arbeidetUtenlands'),
			emptyOpphold.arbeidetUtenlands,
			{ shouldDirty: false }
		)
	}, [activeIndex, currentLand, form])

	useEffect(() => {
		if (activeIndex === null) return
		if (!brukFoedselsdato || !foedselsdato) return
		if (startdato === foedselsdato) return
		form.setValue(getOppholdFieldName(activeIndex, 'brukFoedselsdato'), false, {
			shouldDirty: true,
		})
	}, [activeIndex, brukFoedselsdato, foedselsdato, form, startdato])

	useEffect(() => {
		if (activeIndex === null) return
		clearOppholdErrors(activeIndex)
	}, [activeIndex, arbeidetUtenlands, currentLand, form, startdato, sluttdato])

	useEffect(() => {
		onSubmitDisabledChange?.(isSubmitDisabled)
	}, [isSubmitDisabled, onSubmitDisabledChange])

	const handleAvbryt = () => {
		if (activeIndex === null) return

		if (mode === 'edit' && originalOppholdRef.current) {
			setOppholdValues(activeIndex, originalOppholdRef.current)
		} else if (mode === 'new') {
			replace(savedOpphold)
		}

		closeOppholdEditor()
	}

	const handleEdit = (index: number) => {
		openOppholdEditor(index, getOppholdValues(index))
	}

	const handleDelete = (index: number) => {
		reopenEmptyOppholdRef.current = fields.length === 1
		remove(index)
	}

	const showCopyButton = Boolean(harOppholdUtenforNorge && hasOpphold)
	const showCancelButton = mode === 'edit' || hasOpphold

	const renderEditor = (index: number) => (
		<VStack gap="space-24">
			<HStack justify="start" align="end" gap="space-24">
				<div className={styles.selectLandWrapper}>
					<RHFSelect
						name={getOppholdFieldName(index, 'landkode')}
						label="Land"
						className={styles.selectLand}
					>
						{landOptions.map((land) => (
							<option key={land.landkode || 'empty'} value={land.landkode}>
								{land.navn}
							</option>
						))}
					</RHFSelect>
				</div>

				{currentLand && isAvtaleland(currentLand) && (
					<div className={styles.radioFieldWrapper}>
						<RHFRadio
							name={getOppholdFieldName(index, 'arbeidetUtenlands')}
							legend="Jobbet bruker i landet?"
						/>
					</div>
				)}
			</HStack>
			{currentLand && (
				<>
					<HStack
						justify="start"
						gap="space-24"
						className={styles.dateFieldsHStack}
					>
						<div className={styles.dateFieldWrapper}>
							<RHFDatePicker
								name={getOppholdFieldName(index, 'fom')}
								label="Startdato"
								className={styles.dateFieldInput}
								fromDate={foedselsdatoDate}
							/>
						</div>
						<div className={styles.dateFieldWrapper}>
							<RHFDatePicker
								name={getOppholdFieldName(index, 'tom')}
								label="Sluttdato (valgfritt)"
								className={styles.dateFieldInput}
								fromDate={startdatoDate ?? foedselsdatoDate}
							/>
						</div>
					</HStack>
					<Checkbox
						size="small"
						checked={brukFoedselsdato ?? false}
						onChange={(e) => {
							const checked = (e.target as HTMLInputElement).checked
							form.setValue(
								getOppholdFieldName(index, 'brukFoedselsdato'),
								checked
							)
							if (checked && foedselsdato) {
								form.setValue(getOppholdFieldName(index, 'fom'), foedselsdato, {
									shouldDirty: true,
								})
							}
						}}
					>
						Bruk fødselsdato
					</Checkbox>
				</>
			)}
			<HStack
				justify="end"
				gap="space-16"
				className={styles.actionButtonsHStack}
			>
				{showCancelButton && (
					<Button variant="tertiary" size="small" onClick={handleAvbryt}>
						Avbryt
					</Button>
				)}
				<Button variant="secondary" size="small" onClick={saveOpphold}>
					{mode === 'edit' ? 'Oppdater' : 'Legg til'}
				</Button>
			</HStack>
		</VStack>
	)

	return (
		<>
			<HStack justify="space-between" align="end">
				<RHFRadio
					name="harOppholdUtenforNorge"
					legend="Har bruker opphold utenfor Norge?"
				/>
				{showCopyButton && (
					<Tooltip content="Kopier opphold">
						<CopyButton
							size="small"
							copyText={copyText}
							data-color="accent"
							className={styles.copyButton}
						/>
					</Tooltip>
				)}
			</HStack>

			{harOppholdUtenforNorge && (
				<VStack className={styles.oppholdListWrapper}>
					{hasOpphold && <Divider noMarginTop mediumMargin />}

					<VStack>
						{fields.map((field, index) => {
							if (activeIndex === index) {
								return (
									<VStack key={field.id}>
										{renderEditor(index)}
										<Divider />
									</VStack>
								)
							}
							const opphold = savedOpphold[index]

							return (
								<OppholdListItem
									key={field.id}
									opphold={opphold}
									showActions={activeIndex === null}
									onEdit={() => handleEdit(index)}
									onDelete={() => handleDelete(index)}
								/>
							)
						})}
					</VStack>

					{mode === 'new' && activeIndex !== null && renderEditor(activeIndex)}

					{mode === 'closed' && hasOpphold && (
						<HStack justify="end">
							<Button variant="secondary" size="small" onClick={openNewOpphold}>
								Legg til nytt opphold
							</Button>
						</HStack>
					)}
				</VStack>
			)}
		</>
	)
}
