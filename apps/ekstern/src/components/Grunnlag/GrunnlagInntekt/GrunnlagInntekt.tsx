import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PencilIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, Link, Modal, TextField } from '@navikt/ds-react'

import { GrunnlagSection } from '../GrunnlagSection'
import { AccordionItem } from '@/components/common/AccordionItem'
import { AccordionContext } from '@/components/common/AccordionItem'
import { useGetInntektQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttak,
  selectAarligInntektFoerUttakFraBrukerInput,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatWithoutDecimal } from '@/utils/currency'
import { formatMessageValues } from '@/utils/translations'

import styles from './GrunnlagInntekt.module.scss'

export const GrunnlagInntekt = () => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const modalRef = React.useRef<HTMLDialogElement>(null)
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)
  const aarligInntektFoerUttakFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakFraBrukerInput
  )
  const { data: aarligInntektFoerUttakFraSkatt } = useGetInntektQuery()
  const [validationError, setValidationError] = React.useState<string>('')

  const {
    ref: grunnlagInntektRef,
    isOpen: isInntektAccordionItemOpen,
    toggleOpen: toggleInntektAccordionItem,
  } = React.useContext(AccordionContext)

  const handleTextfieldChange = (): void => {
    setValidationError('')
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const inntektData = data.get('inntekt') as string | undefined

    if (
      inntektData === undefined ||
      inntektData === '' ||
      isNaN(inntektData as unknown as number)
    ) {
      setValidationError(
        intl.formatMessage({
          id: 'grunnlag.inntekt.modal.textfield.validation_error',
        })
      )
    } else {
      // TODO Amplitude logging
      // logger('radiogroup valgt', {
      //   tekst: 'Samtykke',
      //   valg: samtykkeData,
      // })
      // logger('button klikk', {
      //   tekst: 'Neste',
      // })
      dispatch(
        userInputActions.updateCurrentSimulation({
          aarligInntektFoerUttak: parseInt(inntektData, 10),
        })
      )
      /* c8 ignore next 3 */
      if (modalRef.current?.open) {
        modalRef.current?.close()
      }
    }
  }

  const onCancel = (): void => {
    setValidationError('')
    modalRef.current?.close()
  }

  const isInntektGreaterThanZero =
    aarligInntektFoerUttakFraBrukerInput !== null ||
    (aarligInntektFoerUttakFraBrukerInput === null &&
      aarligInntektFoerUttakFraSkatt &&
      aarligInntektFoerUttakFraSkatt.beloep > 0)

  return (
    <>
      <Modal
        ref={modalRef}
        header={{
          heading: intl.formatMessage({ id: 'grunnlag.inntekt.modal.title' }),
        }}
        width={400}
      >
        <Modal.Body>
          <form id="oppdatere-inntekt" method="dialog" onSubmit={onSubmit}>
            <TextField
              data-testid="inntekt-textfield"
              type="number"
              name="inntekt"
              label={intl.formatMessage({
                id: 'grunnlag.inntekt.modal.textfield.label',
              })}
              description={intl.formatMessage({
                id: 'grunnlag.inntekt.modal.textfield.description',
              })}
              error={validationError}
              onChange={handleTextfieldChange}
              defaultValue={aarligInntektFoerUttakFraBrukerInput?.toString()}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button form="oppdatere-inntekt">
            {intl.formatMessage({
              id: 'grunnlag.inntekt.modal.button',
            })}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {intl.formatMessage({
              id: 'stegvisning.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>

      <AccordionItem
        name="Grunnlag: Inntekt"
        isOpen={isInntektAccordionItemOpen}
        onClick={toggleInntektAccordionItem}
      >
        <GrunnlagSection
          ref={grunnlagInntektRef}
          headerTitle={intl.formatMessage({
            id: 'grunnlag.inntekt.title',
          })}
          headerValue={
            isInntektGreaterThanZero
              ? `${formatWithoutDecimal(aarligInntektFoerUttak)} kr`
              : intl.formatMessage({
                  id: 'grunnlag.inntekt.title.error',
                })
          }
        >
          <>
            <BodyLong>
              {isInntektGreaterThanZero ? (
                <FormattedMessage
                  id="grunnlag.inntekt.ingress"
                  values={{
                    ...formatMessageValues,
                    beloep: formatWithoutDecimal(
                      aarligInntektFoerUttakFraSkatt?.beloep
                    ),
                    aar: aarligInntektFoerUttakFraSkatt?.aar,
                  }}
                />
              ) : (
                <FormattedMessage
                  id="grunnlag.inntekt.ingress.error"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              )}
              <br />
              <Link
                className={styles.link}
                onClick={console.log}
                target="_blank"
                inlineText
              >
                <FormattedMessage id="grunnlag.inntekt.link" />
              </Link>
            </BodyLong>

            <Button
              className={styles.button}
              variant="tertiary"
              icon={<PencilIcon aria-hidden />}
              onClick={() => modalRef.current?.showModal()}
            >
              {intl.formatMessage({
                id: 'grunnlag.inntekt.button',
              })}
            </Button>
          </>
        </GrunnlagSection>
      </AccordionItem>
    </>
  )
}
