import landListData from '@pensjonskalkulator-frontend-monorepo/utils/land-list'
import { useState } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'

import { PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Checkbox, HStack, VStack } from '@navikt/ds-react'

import { useBeregningContext } from '../BeregningContext'
import { RHFDatePicker } from '../BeregningForm/rhf-adapters/RHFDatePicker'
import { RHFRadio } from '../BeregningForm/rhf-adapters/RHFRadio'
import { RHFSelect } from '../BeregningForm/rhf-adapters/RHFSelect'

interface LandDetails {
	landkode: string
	navn: string
	kravOmArbeid?: boolean
}

const landList = landListData as LandDetails[]

export const UtenlandsOpphold = () => {
	const { form } = useBeregningContext()
	const { control } = form
	const [harOppholdUtenforNorge] = useWatch({
		control,
		name: ['harOppholdUtenforNorge'] as const,
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'utenlandsOpphold',
	})

	const [editingIndex, setEditingIndex] = useState<number | null>(null)

	const getLandDetails = (landkode: string) =>
		landList.find((l) => l.landkode === landkode)

	const isAvtaleland = (landkode: string) =>
		getLandDetails(landkode)?.kravOmArbeid === true

	const currentLand = useWatch({
		control,
		name: `utenlandsOpphold.${editingIndex ?? 0}.land`,
	})

	const handleNyPeriode = () => {
		append({
			land: '',
			arbeidetUtenlands: null,
			startdato: '',
			sluttdato: '',
			brukFoedselsdato: false,
		})
		setEditingIndex(fields.length)
	}

	const handleLeggTil = () => {
		if (editingIndex === null) return
		const land = form.getValues(`utenlandsOpphold.${editingIndex}.land`)
		if (!land) return
		setEditingIndex(null)
	}

	const handleAvbryt = () => {
		if (editingIndex === null) return
		const land = form.getValues(`utenlandsOpphold.${editingIndex}.land`)
		if (!land) {
			remove(editingIndex)
		}
		setEditingIndex(null)
	}

	const showForm = harOppholdUtenforNorge === true && editingIndex !== null

	return (
		<>
			<RHFRadio
				name="harOppholdUtenforNorge"
				legend="Har bruker opphold utenfor Norge?"
			/>

			{harOppholdUtenforNorge === true && (
				<VStack gap="space-4">
					{fields.map((field, index) => {
						if (editingIndex === index) return null
						const item = form.getValues(`utenlandsOpphold.${index}`)
						const landDetails = getLandDetails(item.land)

						return (
							<HStack key={field.id} gap="space-4" align="center">
								<BodyShort size="small">
									{landDetails?.navn ?? item.land}
									{item.startdato && ` (${item.startdato}`}
									{item.sluttdato
										? ` - ${item.sluttdato})`
										: item.startdato
											? ')'
											: ''}
								</BodyShort>
								<Button
									variant="tertiary"
									size="small"
									disabled={editingIndex !== null}
									onClick={() => setEditingIndex(index)}
								>
									<PencilIcon title="Endre" fontSize="1.5rem" />
								</Button>
								<Button
									variant="tertiary"
									size="small"
									disabled={editingIndex !== null}
									onClick={() => remove(index)}
								>
									<TrashIcon title="Slett" fontSize="1.5rem" />
								</Button>
							</HStack>
						)
					})}

					{showForm && (
						<VStack gap="space-4">
							<HStack gap="space-4" align="center">
								<RHFSelect
									name={`utenlandsOpphold.${editingIndex}.land`}
									label="Land"
								>
									<option value="" />
									{landList.map((land) => (
										<option key={land.landkode} value={land.landkode}>
											{land.navn}
										</option>
									))}
								</RHFSelect>

								{currentLand && isAvtaleland(currentLand) && (
									<RHFRadio
										name={`utenlandsOpphold.${editingIndex}.arbeidetUtenlands`}
										legend="Jobbet bruker i landet?"
									/>
								)}
							</HStack>
							{currentLand && (
								<>
									<HStack gap="space-4">
										<RHFDatePicker
											name={`utenlandsOpphold.${editingIndex}.startdato`}
											label="Startdato"
										/>
										<RHFDatePicker
											name={`utenlandsOpphold.${editingIndex}.sluttdato`}
											label="Sluttdato (valgfritt)"
										/>
									</HStack>
									<Checkbox
										size="small"
										checked={
											form.watch(
												`utenlandsOpphold.${editingIndex}.brukFoedselsdato`
											) ?? false
										}
										onChange={(e) =>
											form.setValue(
												`utenlandsOpphold.${editingIndex}.brukFoedselsdato`,
												e.target.checked
											)
										}
									>
										Bruk fødselsdato
									</Checkbox>
									<HStack gap="space-4">
										<Button
											variant="secondary"
											size="small"
											onClick={handleLeggTil}
										>
											Legg til
										</Button>
										<Button
											variant="tertiary"
											size="small"
											onClick={handleAvbryt}
										>
											Avbryt
										</Button>
									</HStack>
								</>
							)}
						</VStack>
					)}

					{editingIndex === null && (
						<Button variant="secondary" size="small" onClick={handleNyPeriode}>
							{fields.length === 0 ? 'Legg til periode' : 'Ny periode'}
						</Button>
					)}
				</VStack>
			)}
		</>
	)
}
