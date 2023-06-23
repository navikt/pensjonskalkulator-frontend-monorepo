import { Accordion, Skeleton } from '@navikt/ds-react'

export const SectionSkeleton = () => {
  return (
    <Accordion.Item data-testid="section-skeleton">
      <Accordion.Header disabled>
        <Skeleton
          variant="rounded"
          width={200}
          height={getComputedStyle(document.documentElement).getPropertyValue(
            '--a-font-line-height-heading-small'
          )}
        />
      </Accordion.Header>
    </Accordion.Item>
  )
}
