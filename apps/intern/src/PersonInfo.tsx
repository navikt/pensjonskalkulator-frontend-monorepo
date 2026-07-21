import { useState } from 'react'

import { InformationSquareFillIcon, PersonIcon } from '@navikt/aksel-icons'
import {
	BodyShort,
	Button,
	CopyButton,
	HStack,
	InfoCard,
	LocalAlert,
	TextField,
} from '@navikt/ds-react'

import {
	useDecryptPidQuery,
	useEncryptPidMutation,
	useFeatureToggleQuery,
	useOmstillingsstoenadQuery,
	usePersonQuery,
	useVedtakQuery,
} from './api/queries'
import {
	getPesysBrukeroversiktUrl,
	getPidFromUrl,
	getVedtakStatus,
} from './utils'

import styles from './PersonInfo.module.css'

interface PersonInfoProps {
	onPidChange?: (encryptedPid: string) => void
}

export const PersonInfo = ({ onPidChange }: PersonInfoProps) => {
	const pid = getPidFromUrl()
	const { data: fnr } = useDecryptPidQuery(pid)

	const { data: showHentPersonButton } = useFeatureToggleQuery(
		'internsimulator.hent-person-button'
	)

	const { data: person, isError, error } = usePersonQuery(fnr)
	const { data: vedtak } = useVedtakQuery(fnr)
	const { data: omstillingsstoenad } = useOmstillingsstoenadQuery(fnr)
	const vedtakStatus = getVedtakStatus(vedtak, omstillingsstoenad)
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

	const devInputSection = showHentPersonButton?.enabled && (
		<HStack
			gap="space-4"
			align="center"
			justify="end"
			className={`${styles.personInfoWrapper} ${styles.hentPersonSection}`}
		>
			{devInput}
		</HStack>
	)

	const pesysBrukeroversiktUrl = getPesysBrukeroversiktUrl()

	if (!pid) {
		return (
			<>
				{devInputSection}

				<InfoCard data-color="info" size="medium" className={styles.infoCard}>
					<InfoCard.Header icon={<InformationSquareFillIcon aria-hidden />}>
						<InfoCard.Title>Brukerinformasjon mangler</InfoCard.Title>
					</InfoCard.Header>
					<InfoCard.Content>
						Du må hente en bruker i &nbsp;
						<a
							href={pesysBrukeroversiktUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							brukeroversikt
						</a>
						&nbsp; i Pesys før du kan gjøre en beregning i Pensjonskalkulator
					</InfoCard.Content>
				</InfoCard>
			</>
		)
	}

	if (isError || !fnr || !person) {
		return (
			<LocalAlert status="error" size="small">
				<LocalAlert.Header>
					<LocalAlert.Title>Kunne ikke hente bruker</LocalAlert.Title>
				</LocalAlert.Header>
				<LocalAlert.Content>
					{error?.message ?? 'Ukjent feil'}
				</LocalAlert.Content>
			</LocalAlert>
		)
	}
	return (
		<HStack gap="space-4" className={styles.personInfoWrapper}>
			<PersonIcon title="a11y-title" fontSize="1.5rem" />
			<BodyShort size="medium">{fnr}</BodyShort>
			<CopyButton size="small" copyText={fnr} className={styles.copyButton} />
			<BodyShort size="medium">
				<span className={styles.slash}>/</span>
				{person.navn}
			</BodyShort>
			{vedtakStatus && (
				<BodyShort size="medium">
					<span className={styles.slash}>/</span>
					{vedtakStatus}
				</BodyShort>
			)}
			{devInputSection}
		</HStack>
	)
}
