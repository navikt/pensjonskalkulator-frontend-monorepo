import React from 'react'
import { useIntl } from 'react-intl'

import { PortableText } from '@portabletext/react'
import clsx from 'clsx'

import { ReadMore } from '@/components/common/ReadMore'
import { SanityContext } from '@/context/SanityContext'
import { useGetSanityFeatureToggleQuery } from '@/state/api/apiSlice'
import { getSanityPortableTextComponents } from '@/utils/sanity'

import styles from './SanityReadmore.module.scss'

interface IProps {
  id: string
  className?: string
  children?: React.ReactNode
}

export function SanityReadmore({ id, className, children }: IProps) {
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
