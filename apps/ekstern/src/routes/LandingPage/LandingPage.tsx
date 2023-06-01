import { Link } from 'react-router-dom'

import { Card } from '@/components/Card'

export function LandingPage() {
  return (
    <Card>
      <h2>Midlertidig landingsside</h2>
      <Link to="/stegvisning/0">Test kalkulatoren</Link>
    </Card>
  )
}
