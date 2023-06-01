import { Link, useParams } from 'react-router-dom'
export function Step() {
  const { stepId } = useParams()
  return (
    <div>
      <h3>{`Dette er steg ${stepId}`}</h3>
      <Link to="/beregning">Gå til Beregningen</Link>
    </div>
  )
}
