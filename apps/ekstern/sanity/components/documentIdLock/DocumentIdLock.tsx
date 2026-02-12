import { Button, Card, Dialog, Flex, Stack, Text } from '@sanity/ui'
import { useEffect, useState } from 'react'
import { FieldProps, useFormValue } from 'sanity'

interface SanityDocument {
  _createdAt?: string
  [key: string]: unknown
}

export const DocumentIdLock = (props: FieldProps) => {
  const [showDialog, setShowDialog] = useState(false)
  const [hasShownDialog, setHasShownDialog] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const document = useFormValue([]) as SanityDocument

  useEffect(() => {
    if (!hasShownDialog) {
      const createdAt = document?._createdAt
      if (createdAt) {
        const createdAtDate = new Date(createdAt)
        const now = new Date()
        const fiveMinutesInMs = 5 * 60 * 1000
        const elapsed = now.getTime() - createdAtDate.getTime()
        const remaining = fiveMinutesInMs - elapsed

        if (remaining > 0) {
          setShowDialog(true)
          setHasShownDialog(true)
        }
      } else {
        setShowDialog(true)
        setHasShownDialog(true)
      }
    }
  }, [document?._createdAt, hasShownDialog])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const createdAt = document?._createdAt
    if (createdAt) {
      const createdAtDate = new Date(createdAt)
      const fiveMinutesInMs = 5 * 60 * 1000

      const updateCountdown = () => {
        const now = new Date()
        const elapsed = now.getTime() - createdAtDate.getTime()
        const remaining = fiveMinutesInMs - elapsed

        if (remaining <= 0) {
          setTimeRemaining(0)
          if (interval) clearInterval(interval)
        } else {
          setTimeRemaining(Math.ceil(remaining / 1000))
        }
      }

      updateCountdown()

      interval = setInterval(updateCountdown, 1000)
    } else if (!createdAt && hasShownDialog) {
      setTimeRemaining(300)

      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [document?._createdAt, hasShownDialog])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Stack space={3}>
      {showDialog && (
        <Dialog
          header="ID Field Time Limit Warning"
          id="id-warning-dialog"
          onClose={() => setShowDialog(false)}
          width={1}
        >
          <Stack space={4} padding={4}>
            <Text size={2}>
              ⚠️ <strong>Important:</strong> You have exactly{' '}
              <strong>5 minutes</strong> to set the ID for this content.
            </Text>
            <Text size={1}>
              After 5 minutes from creation, the ID field becomes read-only to
              maintain system consistency. Please choose your ID carefully as it
              will be used throughout the application.
            </Text>
            {timeRemaining !== null && timeRemaining > 0 && (
              <Card padding={3} tone="primary" border>
                <Text weight="semibold" align="center">
                  Time remaining: {formatTime(timeRemaining)}
                </Text>
              </Card>
            )}
            <Flex justify="flex-end">
              <Button
                tone="primary"
                text="I understand"
                onClick={() => setShowDialog(false)}
              />
            </Flex>
          </Stack>
        </Dialog>
      )}

      {timeRemaining !== null && timeRemaining > 0 && !showDialog && (
        <Card padding={3} tone="caution" border>
          <Flex justify="center" align="center">
            <Text size={1} weight="semibold">
              ⏱️ ID editing time remaining: {formatTime(timeRemaining)}
            </Text>
          </Flex>
        </Card>
      )}

      {props.renderDefault(props)}
    </Stack>
  )
}
