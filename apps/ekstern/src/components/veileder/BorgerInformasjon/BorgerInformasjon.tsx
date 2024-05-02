import {
  Box,
  HStack,
  Loader,
  CopyButton,
  Spacer,
  Button,
} from '@navikt/ds-react'

import { BASE_PATH } from '@/router/constants'
import { useGetPersonQuery } from '@/state/api/apiSlice'

import styles from './BorgerInformasjon.module.scss'

interface IBorgerInformasjonProps {
  fnr: string
}

export const BorgerInformasjon: React.FC<IBorgerInformasjonProps> = ({
  fnr,
}) => {
  const { data: person, isFetching: isPersonFetching } = useGetPersonQuery()

  const onNullstillClick = () => {
    window.location.href = `${BASE_PATH}/veileder`
  }

  return (
    <Box
      background="bg-default"
      borderWidth="0 0 2 0"
      borderColor="border-divider"
    >
      <HStack align="center" gap="2" className={styles.wrapper} style={{}}>
        {isPersonFetching ? <Loader /> : person?.navn}
        <span aria-hidden="true">/</span>
        <HStack align="center" gap="1">
          F.nr.: {fnr} <CopyButton size="small" copyText={fnr} />
        </HStack>
        <Spacer />
        <div>
          <Button onClick={onNullstillClick} variant="secondary" size="small">
            Nullstill bruker
          </Button>
        </div>
      </HStack>
    </Box>
  )
}
