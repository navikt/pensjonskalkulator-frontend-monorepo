import type { RefObject } from 'react'

import { BodyLong, Button, HStack, Modal, VStack } from '@navikt/ds-react'

type LagreBeregningModalProps = {
	modalRef: RefObject<HTMLDialogElement | null>
	url?: string
}

export const LagreBeregningModal = ({
	modalRef,
	url,
}: LagreBeregningModalProps) => {
	return (
		<Modal
			ref={modalRef}
			header={{
				heading: 'Beregning lagret',
			}}
		>
			<Modal.Body>
				<VStack gap="space-16">
					<BodyLong size="small">Beregningen er lagret.</BodyLong>
				</VStack>
			</Modal.Body>
			<Modal.Footer>
				<HStack gap="space-8" width="20rem">
					{url && (
						<Button
							variant="primary"
							size="small"
							as="a"
							href={url}
							target="_blank"
							rel="noopener noreferrer"
						>
							Åpne brev
						</Button>
					)}
					<Button
						variant="secondary"
						size="small"
						onClick={() => modalRef.current?.close()}
					>
						Lukk
					</Button>
				</HStack>
			</Modal.Footer>
		</Modal>
	)
}
