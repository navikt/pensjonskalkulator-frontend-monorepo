import { useState } from 'react'

import { PersonIcon } from '@navikt/aksel-icons'
import {
	Alert,
	BodyShort,
	Button,
	CopyButton,
	HStack,
	InfoCard,
	TextField,
} from '@navikt/ds-react'

import {
	useDecryptPidQuery,
	useEncryptPidMutation,
	useLoependeVedtakQuery,
	usePersonQuery,
} from './api/queries'
import { getLoependeVedtakStatus, getPidFromUrl } from './utils'

import styles from './PersonInfo.module.css'

interface PersonInfoProps {
	onPidChange?: (encryptedPid: string) => void
}

export const PersonInfo = ({ onPidChange }: PersonInfoProps) => {
	const pid = getPidFromUrl()
	const { data: fnr } = useDecryptPidQuery(pid)

	const { data: person, isError, error } = usePersonQuery(fnr)
	const { data: loependeVedtak } = useLoependeVedtakQuery(fnr)
	const vedtakStatus = getLoependeVedtakStatus(loependeVedtak)
	const { mutate: encryptPid, isPending: isEncrypting } =
		useEncryptPidMutation()
	const [pidInput, setPidInput] = useState('')

	const handleHent = () => {
		if (!pidInput.trim()) return
		encryptPid(pidInput.trim(), {
			onSuccess: (encryptedPid) => {
				onPidChange?.(encryptedPid)
			},
		})
	}

	const devInput = (
		<>
			<TextField
				label="Fødselsnummer"
				hideLabel
				size="small"
				value={pidInput}
				onChange={(e) => setPidInput(e.target.value)}
				htmlSize={15}
			/>
			<Button size="small" onClick={handleHent} loading={isEncrypting}>
				Hent person
			</Button>
		</>
	)

	if (!pid) {
		return (
			<>
				<HStack
					gap="space-4"
					align="center"
					justify="end"
					className={styles.personInfoWrapper}
				>
					{devInput}
				</HStack>

				<InfoCard data-color="info" size="medium" className={styles.infoCard}>
					<InfoCard.Header>
						<InfoCard.Title>Brukerinformasjon mangler</InfoCard.Title>
					</InfoCard.Header>
					<InfoCard.Content>
						Du må hente en bruker i &nbsp;
						<a href="https://pesys.nav.no/brukeroversikt">brukeroversikt</a> i
						Pesys før du kan gjøre en beregning i Pensjonskalkulator
					</InfoCard.Content>
				</InfoCard>
			</>
		)
	}

	if (isError || !fnr || !person) {
		return (
			<Alert variant="error">Kunne ikke hente bruker: {error?.message}</Alert>
		)
	}
	return (
		<HStack gap="space-4" className={styles.personInfoWrapper}>
			<PersonIcon title="a11y-title" fontSize="1.5rem" />
			<BodyShort size="medium">{fnr}</BodyShort>
			<CopyButton size="small" copyText={fnr} />
			<BodyShort size="medium">
				<span>{' / '}</span>
				{person.navn}
			</BodyShort>
			{vedtakStatus && (
				<BodyShort size="medium">
					{' / '}
					{vedtakStatus}
				</BodyShort>
			)}
			<HStack gap="space-4" align="center" style={{ marginLeft: 'auto' }}>
				{devInput}
			</HStack>
		</HStack>
	)
}
