import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'

import { Button, Checkbox, CopyButton, HStack, VStack } from '@navikt/ds-react'

import { useBeregningContext } from '../BeregningContext'
import { RHFDatePicker } from '../BeregningForm/rhf-adapters/RHFDatePicker'
import { RHFRadio } from '../BeregningForm/rhf-adapters/RHFRadio'
import { RHFSelect } from '../BeregningForm/rhf-adapters/RHFSelect'
import { Divider } from '../Divider/Divider'

import './UtenlandsOpphold.css'

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

const parseEndUserDate = (value?: string) => {
	if (!value) return undefined
	const [day, month, year] = value.split('.')
	if (!day || !month || !year) return undefined
	const date = new Date(`${year}-${month}-${day}`)
	return isNaN(date.getTime()) ? undefined : date
}

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
		name: activeFieldName('land'),
	})

	const startdato = useWatch({
		control,
		name: activeFieldName('startdato'),
	})

	const sluttdato = useWatch({
		control,
		name: activeFieldName('sluttdato'),
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

	const getOppholdValues = (index: number): OppholdValues => ({
		land: form.getValues(getOppholdFieldName(index, 'land')),
		arbeidetUtenlands: form.getValues(
			getOppholdFieldName(index, 'arbeidetUtenlands')
		),
		startdato: form.getValues(getOppholdFieldName(index, 'startdato')),
		sluttdato: form.getValues(getOppholdFieldName(index, 'sluttdato')),
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
		form.setValue(getOppholdFieldName(index, 'land'), values.land)
		form.setValue(
			getOppholdFieldName(index, 'arbeidetUtenlands'),
			values.arbeidetUtenlands
		)
		form.setValue(getOppholdFieldName(index, 'startdato'), values.startdato)
		form.setValue(getOppholdFieldName(index, 'sluttdato'), values.sluttdato)
		form.setValue(
			getOppholdFieldName(index, 'brukFoedselsdato'),
			values.brukFoedselsdato
		)
	}

	const getOppholdErrorFields = (index: number) =>
		[
			getOppholdFieldName(index, 'land'),
			getOppholdFieldName(index, 'arbeidetUtenlands'),
			getOppholdFieldName(index, 'startdato'),
			getOppholdFieldName(index, 'sluttdato'),
		] as const

	const clearOppholdErrors = (index: number) => {
		form.clearErrors(getOppholdErrorFields(index))
	}

	const getValidationPeriods = () =>
		fields.map((_, index) => ({
			id: String(index),
			landkode: form.getValues(getOppholdFieldName(index, 'land')),
			arbeidetUtenlands: form.getValues(
				getOppholdFieldName(index, 'arbeidetUtenlands')
			),
			startdato: form.getValues(getOppholdFieldName(index, 'startdato')),
			sluttdato:
				form.getValues(getOppholdFieldName(index, 'sluttdato')) || undefined,
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
		previousLandRef.current = values.land || undefined
		clearOppholdErrors(index)
		setOppholdValues(index, values)
		setActiveIndex(index)
	}

	const closeOppholdEditor = () => {
		if (activeIndex !== null) {
			clearOppholdErrors(activeIndex)
		}
		previousLandRef.current = undefined
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
		if (!harOppholdUtenforNorge) {
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
		if (activeIndex === null || mode !== 'new') return
		setOppholdValues(activeIndex, emptyOpphold)
		closeOppholdEditor()
	}

	const handleSlett = () => {
		if (activeIndex === null || mode !== 'edit') return
		remove(activeIndex)
		closeOppholdEditor()
	}

	const handleEdit = (index: number) => {
		openOppholdEditor(index, getOppholdValues(index))
	}

	const showCopyButton = Boolean(harOppholdUtenforNorge && hasOpphold)

	const renderEditor = (index: number) => (
		<VStack gap="space-24">
			<HStack justify="start" align="end" gap="space-24">
				<div className="selectLandWrapper">
					<RHFSelect
						name={getOppholdFieldName(index, 'land')}
						label="Land"
						className="selectLand"
					>
						{landOptions.map((land) => (
							<option key={land.landkode || 'empty'} value={land.landkode}>
								{land.navn}
							</option>
						))}
					</RHFSelect>
				</div>

				{currentLand && isAvtaleland(currentLand) && (
					<div className="radioFieldWrapper">
						<RHFRadio
							name={getOppholdFieldName(index, 'arbeidetUtenlands')}
							legend="Jobbet bruker i landet?"
						/>
					</div>
				)}
			</HStack>
			{currentLand && (
				<>
					<HStack gap="space-16">
						<div className="dateFieldWrapper">
							<RHFDatePicker
								name={getOppholdFieldName(index, 'startdato')}
								label="Startdato"
								className="dateFieldInput"
								fromDate={foedselsdatoDate}
							/>
						</div>
						<div className="dateFieldWrapper">
							<RHFDatePicker
								name={getOppholdFieldName(index, 'sluttdato')}
								label="Sluttdato (valgfritt)"
								className="dateFieldInput"
								fromDate={startdatoDate ?? foedselsdatoDate}
							/>
						</div>
					</HStack>
					<Checkbox
						size="small"
						checked={brukFoedselsdato ?? false}
						onChange={(e) => {
							const checked = e.target.checked
							form.setValue(
								getOppholdFieldName(index, 'brukFoedselsdato'),
								checked
							)
							if (checked && foedselsdato) {
								form.setValue(
									getOppholdFieldName(index, 'startdato'),
									foedselsdato,
									{ shouldDirty: true }
								)
							}
						}}
					>
						Bruk fødselsdato
					</Checkbox>
					<HStack justify="end" gap="space-16">
						{mode === 'edit' ? (
							<>
								<Button variant="tertiary" size="small" onClick={handleSlett}>
									Slett
								</Button>
								<Button variant="secondary" size="small" onClick={saveOpphold}>
									Lagre
								</Button>
							</>
						) : !hasOpphold ? (
							<Button variant="secondary" size="small" onClick={saveOpphold}>
								Legg til
							</Button>
						) : (
							<>
								<Button variant="tertiary" size="small" onClick={handleAvbryt}>
									Avbryt
								</Button>
								<Button variant="secondary" size="small" onClick={saveOpphold}>
									Lagre
								</Button>
							</>
						)}
					</HStack>
				</>
			)}
		</VStack>
	)

	return (
		<>
			<HStack justify="space-between" align="end">
				<RHFRadio
					name="harOppholdUtenforNorge"
					legend="Har bruker opphold utenfor Norge?"
				/>
				{showCopyButton && <CopyButton size="small" copyText={copyText} />}
			</HStack>

			{harOppholdUtenforNorge && (
				<VStack>
					{hasOpphold && <Divider mediumMargin />}

					<VStack>
						{fields.map((field, index) => {
							if (activeIndex === index) {
								return (
									<VStack key={field.id}>
										{renderEditor(index)}
										<Divider mediumMargin />
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
									onDelete={() => remove(index)}
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
