import { useEffect, useState } from 'react'
import { getMachine, deleteMachine } from './db.js'
import { go } from './useRoute.js'
import { usePhotoUrl } from './usePhotoUrl.js'

export default function MachineDetail({ id }) {
  const [m, setM] = useState(undefined)
  const [confirming, setConfirming] = useState(false)
  const url = usePhotoUrl(m?.photo)

  useEffect(() => {
    getMachine(id).then(setM)
  }, [id])

  if (m === undefined) return <main><p className="muted">Loading…</p></main>
  if (!m)
    return (
      <main>
        <p>Machine not found.</p>
        <button className="btn" onClick={() => go('/')}>Back to list</button>
      </main>
    )

  const info = [
    ['Make', m.make],
    ['Model', m.model],
    ['Year', m.year],
    ['Serial #', m.serial],
    ['Engine hours', m.hours],
  ].filter(([, v]) => v)

  const remove = async () => {
    await deleteMachine(id)
    go('/')
  }

  return (
    <>
      <header className="bar">
        <button className="btn bar-btn" onClick={() => go('/')}>← Back</button>
        <h1>{m.name}</h1>
      </header>
      <main>
        {url && <img className="hero" src={url} alt={m.name} />}

        {info.length > 0 && (
          <section>
            <h2>Details</h2>
            <dl className="kv">
              {info.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </section>
        )}

        <section>
          <h2>Filters</h2>
          {m.filters.length === 0 ? (
            <p className="muted">None added.</p>
          ) : (
            <dl className="kv">
              {m.filters.map((f) => (
                <div key={f.id}><dt>{f.label}</dt><dd className="mono">{f.partNumber}</dd></div>
              ))}
            </dl>
          )}
        </section>

        <section>
          <h2>Fluids</h2>
          {m.fluids.length === 0 ? (
            <p className="muted">None added.</p>
          ) : (
            <dl className="kv">
              {m.fluids.map((f) => (
                <div key={f.id}>
                  <dt>{f.label}</dt>
                  <dd>{[f.type, f.capacity].filter(Boolean).join(' — ')}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {m.notes && (
          <section>
            <h2>Notes</h2>
            <p className="notes">{m.notes}</p>
          </section>
        )}

        <section>
          {confirming ? (
            <div className="confirm">
              <p>Delete <strong>{m.name}</strong> for good?</p>
              <button className="btn danger" onClick={remove}>Yes, delete it</button>
              <button className="btn" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn danger-outline" onClick={() => setConfirming(true)}>Delete machine</button>
          )}
        </section>
      </main>
      <div className="actionbar">
        <button className="btn primary" onClick={() => go(`/m/${id}/edit`)}>Edit Machine</button>
      </div>
    </>
  )
}
