/* c8 ignore start */
import cl from 'clsx'
import React, { forwardRef, useMemo, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import { Button, Heading, HeadingProps, useId } from '@navikt/ds-react'

import { logger } from '@/utils/logging'

import './ShowMore.styles.css'

type PossibleRef<T> = React.Ref<T> | undefined
export function mergeRefs<T>(refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref !== null && ref !== undefined) {
        ref.current = value
      }
    })
  }
}
export type ShowMoreRef = {
  isOpen: boolean
  toggleOpen: () => void
  scrollTo: () => void
  focus: () => void
}

export interface ShowMoreProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'onClick'
> {
  /**
   * Override what element to render the wrapper as.
   *
   * @default aside
   */
  as?: 'aside' | 'section'
  /**
   * Content. Is [inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert) when collapsed.
   */
  children: React.ReactNode
  /**
   * Changes button size
   *
   * @default medium
   */
  size?: 'medium' | 'small'
  /**
   * Changes background color
   *
   * @default default
   */
  variant?: 'default' | 'subtle' | 'info'
  /**
   * Custom height of content when collapsed.
   *
   * @default 10rem
   */
  collapsedHeight?: `${number}${string}` | number
  /**
   * Heading text. Always available to screen readers.
   * Used as accessible label unless you define `aria-label` or `aria-labelledby`.
   */
  heading?: string
  /**
   * Heading size
   *
   * @default medium
   */
  headingSize?: HeadingProps['size']
  /**
   * Heading level
   *
   * @default "1"
   */
  headingLevel?: HeadingProps['level']
  /**
   * Scroll back up to the component after collapsing.
   *
   * @default true
   */
  scrollBackOnCollapse?: boolean
  /**
   * Navn på på innhold.
   * Brukes til logging i Umami
   */
  name: string
}

/**
 * A component for partially hiding less important content.
 *
 * @see [📝 Documentation](https://aksel.nav.no/komponenter/core/show-more)
 * @see 🏷️ {@link ShowMoreProps}
 *
 * @example
 * <ShowMore heading="Facts about toads">
 *   Toads have dry, leathery skin, short legs, and large bumps covering the parotoid glands.
 * </ShowMore>
 */
export const ShowMore = forwardRef<ShowMoreRef, ShowMoreProps>(
  (
    {
      as: Component = 'aside',
      children,
      size = 'medium',
      variant = 'default',
      collapsedHeight = '10rem',
      heading,
      headingSize = 'medium',
      headingLevel = '1',
      scrollBackOnCollapse = true,
      className,
      name,
      'aria-labelledby': ariaLabelledby,
      ...rest
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const localRef = useRef<HTMLElement>(null)
    const scrollTo = () => {
      const SCROLL_OFFSET = 55
      if (!localRef?.current) return
      window.scrollBy({
        top: localRef.current.getBoundingClientRect().top - SCROLL_OFFSET,
        behavior: 'smooth',
      })
    }
    const focus = () => {
      localRef.current?.focus()
      scrollTo()
      if (!isOpen) {
        toggleOpen()
      }
    }
    const toggleOpen = () => {
      if (isOpen) {
        logger('show more lukket', { tekst: name })
        setIsOpen(false)
        if (scrollBackOnCollapse) {
          scrollTo()
        }
      } else {
        logger('show more åpnet', { tekst: name })
        setIsOpen(true)
      }
    }

    const ariaLabelId = useId()

    const ChevronIcon = isOpen ? ChevronUpIcon : ChevronDownIcon

    // For å kunne bruke ref fra utsiden
    React.useImperativeHandle(ref, () => ({
      isOpen,
      toggleOpen,
      scrollTo,
      focus,
    }))

    const mergedRef = useMemo(
      () => mergeRefs<HTMLElement | ShowMoreRef>([localRef, ref]),
      [ref]
    )

    return (
      <Component
        ref={mergedRef}
        className={cl(
          'navds-show-more',
          `navds-show-more--${variant}`,
          className,
          { 'navds-show-more--closed': !isOpen }
        )}
        aria-labelledby={
          !ariaLabelledby && !rest['aria-label'] ? ariaLabelId : ariaLabelledby
        }
        {...rest}
      >
        {heading && (
          <Heading size={headingSize} level={headingLevel} id={ariaLabelId}>
            {heading}
          </Heading>
        )}

        <div className="navds-show-more__button-section">
          <div className="navds-show-more__button-wrapper">
            <Button
              data-testid="showmore-button"
              type="button"
              variant="secondary-neutral"
              className="navds-show-more__button"
              icon={<ChevronIcon aria-hidden />}
              iconPosition="right"
              size={size}
              onClick={toggleOpen}
            >
              <FormattedMessage
                id={isOpen ? 'showmore.vis_mindre' : 'showmore.vis_mer'}
              />
            </Button>
          </div>
        </div>

        <div
          className="navds-show-more__content"
          style={isOpen ? {} : { height: collapsedHeight }}
          inert={isOpen ? undefined : true}
        >
          {children}
        </div>
      </Component>
    )
  }
)
ShowMore.displayName = 'ShowMore'

export default ShowMore
/* c8 ignore end */
