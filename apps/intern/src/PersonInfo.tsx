import { FilesIcon, PersonIcon } from '@navikt/aksel-icons'
import { Alert, BodyShort, HStack, InfoCard, Loader } from '@navikt/ds-react'

import { useLoependeVedtakQuery, usePersonQuery } from './api/queries'
import { getFnrFromUrl, getLoependeVedtakStatus } from './utils'

import styles from './PersonInfo.module.css'

export const PersonInfo = () => {
	const fnr = getFnrFromUrl()

	const { data: person, isLoading, isError, error } = usePersonQuery(fnr)
	const { data: loependeVedtak } = useLoependeVedtakQuery(fnr)
	const vedtakStatus = getLoependeVedtakStatus(loependeVedtak)

	if (!fnr) {
		return (
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
		)
	}

	return (
		<div>
			{isLoading && <Loader size="xlarge" title="Henter bruker..." />}

			{isError && (
				<Alert variant="error">Kunne ikke hente bruker: {error?.message}</Alert>
			)}

			{person && (
				<HStack gap="space-4" className={styles.personInfoWrapper}>
					<PersonIcon title="a11y-title" fontSize="1.5rem" />
					<BodyShort size="medium">{fnr}</BodyShort>
					<FilesIcon title="a11y-title" fontSize="1.5rem" />
					<BodyShort size="medium">
						<span>{' / '}</span>
						{person.navn}
					</BodyShort>
					<BodyShort size="medium">
						{' / '}
						{vedtakStatus}
					</BodyShort>
				</HStack>
			)}
		</div>
	)
}
