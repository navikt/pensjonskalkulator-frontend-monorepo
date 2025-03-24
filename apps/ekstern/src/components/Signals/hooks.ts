import { useEffect } from 'react'

const SIGNALS_SCRIPT_URL = 'https://widget.uxsignals.com/embed.js'

/**
 * Hook to load UX Signals script when component is ready
 * @param ready Boolean indicating if the component is ready to load the script
 */
const useSignals = (ready: boolean): void => {
  useEffect(() => {
    if (!ready) return

    const existingScript = document.querySelector(
      `script[src="${SIGNALS_SCRIPT_URL}"]`
    )

    if (existingScript) return // Script already exists, no need to add again

    const script = document.createElement('script')
    script.async = true
    script.src = SIGNALS_SCRIPT_URL

    script.onerror = () => {
      console.error('Failed to load UX Signals script')
    }

    document.body.appendChild(script)

    return () => {
      // Only remove script if this component was responsible for adding it
      if (script.isConnected) {
        document.body.removeChild(script)
      }
    }
  }, [ready])
}

export default useSignals
