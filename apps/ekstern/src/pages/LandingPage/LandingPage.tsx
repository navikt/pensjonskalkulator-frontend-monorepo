import { Link } from 'react-router-dom'

import { Card } from '@/components/common/Card'

export function LandingPage() {
  return (
    <Card hasLargePadding>
      <h2>Utlogget landingsside</h2>
      <Link to="/start" reloadDocument>
        Logg inn og test kalkulatoren
      </Link>
    </Card>
  )
}
