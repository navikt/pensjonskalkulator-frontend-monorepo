import { PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, HStack, VStack } from '@navikt/ds-react'

import { Divider } from '../Divider/Divider'
import type { OppholdValues } from './types'
import { getLandDetails, getOppholdSummaryText } from './utils'

type OppholdListItemProps = {
	opphold: OppholdValues
	showActions: boolean
	onEdit: () => void
	onDelete: () => void
}

export const OppholdListItem = ({
	opphold,
	showActions,
	onEdit,
	onDelete,
}: OppholdListItemProps) => {
	const landDetails = getLandDetails(opphold.landkode)
	const oppholdSummaryText = getOppholdSummaryText(opphold)

	if (!landDetails) {
		return null
	}

	return (
		<VStack>
			<HStack align="center" gap="space-16">
				<div style={{ flex: 1, minWidth: 0 }}>
					<VStack gap="space-2">
						<BodyShort size="small">
							<strong>{landDetails?.navn ?? opphold.landkode}</strong>
						</BodyShort>
						<BodyShort size="small">{oppholdSummaryText}</BodyShort>
					</VStack>
				</div>
				{showActions && (
					<HStack
						gap="space-8"
						align="end"
						style={{ flexShrink: 0, marginLeft: 'auto' }}
					>
						<Button variant="tertiary" size="small" onClick={onEdit}>
							<PencilIcon title="Endre" fontSize="1.5rem" />
						</Button>
						<Button variant="tertiary" size="small" onClick={onDelete}>
							<TrashIcon title="Slett" fontSize="1.5rem" />
						</Button>
					</HStack>
				)}
			</HStack>
			<Divider mediumMargin />
		</VStack>
	)
}
