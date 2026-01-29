import React from 'react'

import { isViewPortMobile } from './viewport'

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(
    isViewPortMobile(window.innerWidth)
  )

  const handleResize = () => {
    setIsMobile(isViewPortMobile(window.innerWidth))
  }

  React.useEffect(() => {
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  })

  return isMobile
}
