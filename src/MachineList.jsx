import { useEffect, useState } from 'react'
import { listMachines } from './db.js'
import { go } from './useRoute.js'
import { usePhotoUrl } from './usePhotoUrl.js'

function Card({ m }) {
  const url = usePhotoUrl(m.photo)
  const sub = [m.year, m.make, m.model].filter(Boolean).join(' ')
  return (
    <li>
      <button className="card" onClick={() => go(`/m/${m.id}`)}>
        {url ? <img src={url} alt="" /> : <span className="noimg" aria-hidden="true">🚜</span>}
        <span className="card-text">
          <strong>{m.name}</strong>
          {sub && <span>{sub}</span>}
        </span>
      </button>
    </li>
  )
}

export default function MachineList() {
  const [machines, setMachines] = useState(null)
  useEffect(() => {
    listMachines().then(setMachines)
  }, [])

  return (
    <>
      <header className="bar">
        <h1>My Machines</h1>
      </header>
      <main>
        {machines === null ? (
          <p className="muted">Loading…</p>
        ) : machines.length === 0 ? (
          <div className="empty">
            <p>No machines yet.</p>
            <p>Tap the big button below to add your first one.</p>
          </div>
        ) : (
          <ul className="cards">
            {machines.map((m) => (
              <Card key={m.id} m={m} />
            ))}
          </ul>
        )}
      </main>
      <div className="actionbar">
        <button className="btn primary" onClick={() => go('/new')}>
          + Add Machine
        </button>
      </div>
    </>
  )
}
