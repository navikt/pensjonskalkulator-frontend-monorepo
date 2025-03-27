import React from 'react'
import { useIntl } from 'react-intl'

import { PortableText } from '@portabletext/react'
import clsx from 'clsx'

import { ReadMore } from '@/components/common/ReadMore'
import { SanityContext } from '@/context/SanityContext'
import { useGetSanityFeatureToggleQuery } from '@/state/api/apiSlice'
import { getSanityPortableTextComponents } from '@/utils/sanity'

import styles from './SanityReadmore.module.scss'

interface Props {
  id: string
  className?: string
  children?: React.ReactNode
}

export const SanityReadmore = ({ id, className, children }: Props) => {
  const intl = useIntl()
  const { readMoreData } = React.useContext(SanityContext)
  const { data: sanityFeatureToggle } = useGetSanityFeatureToggleQuery()
  const sanityContent = readMoreData[id]

  if (children && (!sanityFeatureToggle?.enabled || !sanityContent)) {
    return children
  }

  return (
    <ReadMore
      data-testid={sanityContent.name}
      name={sanityContent.name}
      header={sanityContent.overskrift}
      className={clsx(styles.wrapper, className)}
    >
      <PortableText
        value={sanityContent.innhold}
        components={getSanityPortableTextComponents(intl)}
      />
    </ReadMore>
  )
}
