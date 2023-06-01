import { Outlet } from 'react-router-dom'

import { Card } from '@/components/Card'
export function Stegvisning() {
  return (
    <Card>
      <h2>Midlertidig stegvisning</h2>
      <Outlet />
    </Card>
  )
}
