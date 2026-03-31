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
	hasRequiredOppholdValues,
	isAvtaleland,
	landList,
} from './utils'

const parseEndUserDate = (value?: string) => {
	if (!value) return undefined
	const [day, month, year] = value.split('.')
	if (!day || !month || !year) return undefined
	const date = new Date(`${year}-${month}-${day}`)
	return isNaN(date.getTime()) ? undefined : date
}

export const UtenlandsOpphold = () => {
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

	const hasRequiredValuesForDraft =
		mode !== 'closed' &&
		hasRequiredOppholdValues({
			currentLand,
			startdato,
			arbeidetUtenlands,
		})

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

	const openDraft = (index: number, values: OppholdValues) => {
		previousLandRef.current = values.land || undefined
		setOppholdValues(index, values)
		setActiveIndex(index)
	}

	const closeDraft = () => {
		previousLandRef.current = undefined
		setActiveIndex(null)
	}

	useEffect(() => {
		if (!harOppholdUtenforNorge) {
			closeDraft()
			return
		}
		if (fields.length === 0 && activeIndex === null) {
			openDraft(0, emptyOpphold)
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

	const handleNyPeriode = () => {
		if (mode === 'closed') {
			openDraft(fields.length, emptyOpphold)
			return
		}
		if (!hasRequiredValuesForDraft) return

		if (activeIndex === null) return
		const currentOpphold = getOppholdValues(activeIndex)

		if (mode === 'edit') {
			update(activeIndex, currentOpphold)
		} else {
			replace([
				...fields.map((_, index) => getOppholdValues(index)),
				currentOpphold,
			])
		}
		closeDraft()
	}

	const handleAvbryt = () => {
		if (activeIndex === null || mode !== 'new') return
		setOppholdValues(activeIndex, emptyOpphold)
		closeDraft()
	}

	const handleSlett = () => {
		if (activeIndex === null || mode !== 'edit') return
		remove(activeIndex)
		closeDraft()
	}

	const handleEdit = (index: number) => {
		openDraft(index, getOppholdValues(index))
	}

	const showCopyButton = harOppholdUtenforNorge && hasOpphold

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
						<RHFDatePicker
							name={getOppholdFieldName(index, 'startdato')}
							label="Startdato"
							fromDate={foedselsdatoDate}
						/>
						<RHFDatePicker
							name={getOppholdFieldName(index, 'sluttdato')}
							label="Sluttdato (valgfritt)"
							fromDate={startdatoDate ?? foedselsdatoDate}
						/>
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
								<Button
									variant="secondary"
									size="small"
									onClick={handleNyPeriode}
									disabled={!hasRequiredValuesForDraft}
								>
									Lagre
								</Button>
							</>
						) : !hasOpphold ? (
							<Button
								variant="secondary"
								size="small"
								onClick={handleNyPeriode}
								disabled={!hasRequiredValuesForDraft}
							>
								Legg til
							</Button>
						) : (
							<>
								<Button variant="tertiary" size="small" onClick={handleAvbryt}>
									Avbryt
								</Button>
								<Button
									variant="secondary"
									size="small"
									onClick={handleNyPeriode}
									disabled={!hasRequiredValuesForDraft}
								>
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
							<Button
								variant="secondary"
								size="small"
								onClick={handleNyPeriode}
							>
								Legg til nytt opphold
							</Button>
						</HStack>
					)}
				</VStack>
			)}
		</>
	)
}
