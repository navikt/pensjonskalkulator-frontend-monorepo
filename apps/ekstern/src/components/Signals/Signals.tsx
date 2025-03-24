import { useEffect, useState } from 'react'

import clsx from 'clsx'

import useSignals from './hooks'

import styles from './Signals.module.scss'

type ActiveEndpointRes = {
  active: boolean
  language: 'en' | 'no' | 'fi' | 'da'
  widgetUrl: string
  questionType: 'calendarStep' | 'checkboxes' | 'multipleChoice' | 'studyPanel'
  header: string
  description: string
  options: Array<{
    label: string
    position: number
    answerUrl: string
  }>
}

interface Props {
  id: string
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  demo?: boolean
}

export const Signals = ({ id, breakpoint = 'xs', demo = false }: Props) => {
  const [isActive, setIsActive] = useState(demo)

  // Check if the study is active
  useEffect(() => {
    const checkActiveStatus = async () => {
      try {
        const response = await fetch(
          `https://api.uxsignals.com/v2/study/id/${id}/active`
        )
        if (!response.ok) {
          setIsActive(false)
          return
        }

        const { active } = (await response.json()) as ActiveEndpointRes
        setIsActive(active)
      } catch {
        setIsActive(false)
      }
    }

    if (!demo) {
      checkActiveStatus()
    }
  }, [id, demo])

  useSignals(isActive)

  if (!isActive) return null

  return (
    <div className={styles.container}>
      <section className={clsx(styles.section, styles[breakpoint])}>
        <div
          data-uxsignals-embed={id}
          data-uxsignals-mode={demo ? 'demo' : undefined}
        />
      </section>
    </div>
  )
}

export default Signals
