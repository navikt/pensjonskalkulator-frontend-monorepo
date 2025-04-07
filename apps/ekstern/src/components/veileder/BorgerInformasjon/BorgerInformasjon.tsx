import {
  Box,
  HStack,
  Loader,
  CopyButton,
  Spacer,
  Button,
  BodyShort,
  BodyLong,
} from '@navikt/ds-react'

import { BASE_PATH } from '@/router/constants'
import { useGetPersonQuery } from '@/state/api/apiSlice'

import styles from './BorgerInformasjon.module.scss'

interface Props {
  fnr: string
}

const formatFnr = (fnr: string) => {
  return `${fnr.slice(0, 6)} ${fnr.slice(6)}`
}

export const BorgerInformasjon = ({ fnr }: Props) => {
  const { data: person, isFetching: isPersonFetching } = useGetPersonQuery()

  const onNullstillClick = () => {
    window.location.href = `${BASE_PATH}/veileder`
  }

  return (
    <Box
      background="bg-default"
      borderWidth="0 0 1 0"
      borderColor="border-divider"
    >
      <HStack align="center" gap="2" className={styles.wrapper} style={{}}>
        <BodyLong weight="semibold">
          {isPersonFetching ? <Loader /> : person?.navn}
        </BodyLong>
        <span aria-hidden="true">/</span>
        <HStack align="center" gap="1">
          <BodyShort data-testid="borger-fnr" size="small" weight="semibold">
            F.nr.: {formatFnr(fnr)}
          </BodyShort>
          <CopyButton size="small" copyText={fnr} />
        </HStack>
        <Spacer />
        <HStack gap="2">
          <Button
            onClick={onNullstillClick}
            data-testid="borger-nullstill"
            variant="secondary"
            size="small"
          >
            Nullstill bruker
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}
