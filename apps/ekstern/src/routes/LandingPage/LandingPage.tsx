import { Link } from 'react-router-dom'

import { ResponsiveCard } from '@/components/components/ResponsiveCard'

export function LandingPage() {
  return (
    <ResponsiveCard hasLargePadding>
      <h2>Utlogget landingsside</h2>
      <Link to="/start" reloadDocument>
        Logg inn og test kalkulatoren
      </Link>
    </ResponsiveCard>
  )
}
