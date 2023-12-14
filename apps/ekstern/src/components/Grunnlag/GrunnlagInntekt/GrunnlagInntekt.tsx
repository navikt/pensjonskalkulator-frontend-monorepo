import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PencilIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  Button,
  Label,
  Link,
  Modal,
  TextField,
} from '@navikt/ds-react'

import { GrunnlagSection } from '../GrunnlagSection'
import { AccordionItem } from '@/components/common/AccordionItem'
import { useGetInntektQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttak,
  selectAarligInntektFoerUttakFraBrukerInput,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatWithoutDecimal } from '@/utils/currency'
import { logger } from '@/utils/logging'
import { formatMessageValues } from '@/utils/translations'

import { validateInntektInput } from './utils'

import styles from './GrunnlagInntekt.module.scss'

export const GrunnlagInntekt = () => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const infoModalRef = React.useRef<HTMLDialogElement>(null)
  const inntektModalRef = React.useRef<HTMLDialogElement>(null)
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)
  const aarligInntektFoerUttakFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakFraBrukerInput
  )
  const { data: aarligInntektFoerUttakFraSkatt } = useGetInntektQuery()
  const [validationError, setValidationError] = React.useState<string>('')
  const [oppdatertInntekt, setOppdatertInntekt] = React.useState<string>(
    aarligInntektFoerUttakFraBrukerInput?.toString() ?? ''
  )

  const handleTextfieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setOppdatertInntekt(e.target.value)
    setValidationError('')
  }

  const openInfoModal = () => {
    logger('modal åpnet', {
      tekst: 'Grunnlag: info om pensjonsgivende inntekt',
    })
    infoModalRef.current?.showModal()
  }
  const openInntektModal = () => {
    logger('modal åpnet', {
      tekst: 'Grunnlag: endring av pensjonsgivende inntekt',
    })
    inntektModalRef.current?.showModal()
  }

  const updateValidationErrorMessage = (id: string) => {
    setValidationError(
      intl.formatMessage({
        id,
      })
    )
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const inntektData = data.get('inntekt') as string | undefined

    if (validateInntektInput(inntektData, updateValidationErrorMessage)) {
      dispatch(
        userInputActions.updateCurrentSimulation({
          aarligInntektFoerUttak: parseInt(inntektData as string, 10),
        })
      )
      logger('button klikk', {
        tekst: 'endrer pensjonsgivende inntekt',
      })
      /* c8 ignore next 3 */
      if (inntektModalRef.current?.open) {
        setOppdatertInntekt('')
        inntektModalRef.current?.close()
      }
    }
  }

  const onCancel = (): void => {
    setOppdatertInntekt('')
    setValidationError('')
    if (inntektModalRef.current?.open) {
      inntektModalRef.current?.close()
    }
  }

  const isInntektGreaterThanZero =
    aarligInntektFoerUttakFraBrukerInput !== null ||
    (aarligInntektFoerUttakFraBrukerInput === null &&
      aarligInntektFoerUttakFraSkatt &&
      aarligInntektFoerUttakFraSkatt.beloep > 0)

  return (
    <>
      <Modal
        ref={infoModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'grunnlag.inntekt.infomodal.title',
          }),
        }}
        width="medium"
      >
        <Modal.Body>
          <Label as="h2">
            <FormattedMessage id="grunnlag.inntekt.infomodal.subtitle" />
          </Label>
          <ul>
            <li>
              <FormattedMessage id="grunnlag.inntekt.infomodal.list_item1" />
            </li>
            <li>
              <FormattedMessage id="grunnlag.inntekt.infomodal.list_item2" />
            </li>
            <li>
              <FormattedMessage id="grunnlag.inntekt.infomodal.list_item3" />
            </li>
            <li>
              <FormattedMessage id="grunnlag.inntekt.infomodal.list_item4" />
            </li>
            <li>
              <FormattedMessage id="grunnlag.inntekt.infomodal.list_item5" />
            </li>
            <li>
              <FormattedMessage id="grunnlag.inntekt.infomodal.list_item6" />
            </li>
            <li>
              <FormattedMessage id="grunnlag.inntekt.infomodal.list_item7" />
            </li>
            <li>
              <FormattedMessage id="grunnlag.inntekt.infomodal.list_item8" />
            </li>
            <li>
              <FormattedMessage id="grunnlag.inntekt.infomodal.list_item9" />
            </li>
          </ul>
          <BodyLong>
            <FormattedMessage
              id="grunnlag.inntekt.infomodal.ingress"
              values={{
                ...formatMessageValues,
              }}
            />
          </BodyLong>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={() => infoModalRef.current?.close()}>
            {intl.formatMessage({ id: 'grunnlag.inntekt.infomodal.lukk' })}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        ref={inntektModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'grunnlag.inntekt.inntektmodal.title',
          }),
        }}
        onClose={onCancel}
        width="small"
      >
        <Modal.Body>
          <form id="oppdatere-inntekt" method="dialog" onSubmit={onSubmit}>
            <TextField
              data-testid="inntekt-textfield"
              type="text"
              inputMode="numeric"
              name="inntekt"
              label={intl.formatMessage({
                id: 'grunnlag.inntekt.inntektmodal.textfield.label',
              })}
              description={intl.formatMessage({
                id: 'grunnlag.inntekt.inntektmodal.textfield.description',
              })}
              error={validationError}
              onChange={handleTextfieldChange}
              value={oppdatertInntekt}
              max={5}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button form="oppdatere-inntekt">
            {intl.formatMessage({
              id: 'grunnlag.inntekt.inntektmodal.button',
            })}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {intl.formatMessage({
              id: 'stegvisning.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>

      <AccordionItem name="Grunnlag: Inntekt">
        <GrunnlagSection
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
                href="#"
                className={styles.link}
                onClick={openInfoModal}
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
              onClick={openInntektModal}
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
