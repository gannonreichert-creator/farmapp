import { useEffect, useState } from 'react'
import { getMachine, saveMachine, newId } from './db.js'
import { shrinkPhoto } from './image.js'
import { go, back } from './useRoute.js'
import { usePhotoUrl } from './usePhotoUrl.js'

const EMPTY = {
  name: '', make: '', model: '', year: '', serial: '', hours: '', notes: '',
  photo: null, filters: [], fluids: [],
}

// Quick-pick suggestions so you don't have to type the common ones.
const FILTER_LABELS = ['Engine oil', 'Fuel', 'Fuel (primary)', 'Hydraulic', 'Air (primary)', 'Air (secondary)', 'Cabin air', 'Transmission']
const FLUID_LABELS = ['Engine oil', 'Hydraulic', 'Transmission', 'Coolant', 'Front axle', 'Rear axle', 'Fuel tank', 'Grease']

export default function MachineForm({ id }) {
  const [m, setM] = useState(id ? null : EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const url = usePhotoUrl(m?.photo)

  useEffect(() => {
    if (id) getMachine(id).then((x) => setM(x || false))
  }, [id])

  if (m === null) return <main><p className="muted">Loading…</p></main>
  if (m === false) return <main><p>Machine not found.</p><button className="btn" onClick={() => go('/')}>Back to list</button></main>

  const set = (k, v) => setM((prev) => ({ ...prev, [k]: v }))
  const setRow = (key, rowId, patch) =>
    setM((prev) => ({ ...prev, [key]: prev[key].map((r) => (r.id === rowId ? { ...r, ...patch } : r)) }))
  const addRow = (key, row) => setM((prev) => ({ ...prev, [key]: [...prev[key], { id: newId(), ...row }] }))
  const delRow = (key, rowId) => setM((prev) => ({ ...prev, [key]: prev[key].filter((r) => r.id !== rowId) }))

  const onPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      set('photo', await shrinkPhoto(file))
      setError('')
    } catch {
      setError('Could not read that photo. Try another one.')
    }
  }

  const save = async (e) => {
    e.preventDefault()
    if (!m.name.trim()) {
      setError('Please give the machine a name.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(true)
    try {
      // Drop rows the user left completely blank.
      const clean = {
        ...m,
        name: m.name.trim(),
        filters: m.filters.filter((f) => f.label.trim() || f.partNumber.trim()),
        fluids: m.fluids.filter((f) => f.label.trim() || f.type.trim() || f.capacity.trim()),
      }
      const saved = await saveMachine(clean)
      window.location.replace(`#/m/${saved.id}`)
    } catch {
      setError('Could not save. Your phone may be out of storage.')
      setSaving(false)
    }
  }

  const field = (label, key, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input value={m[key]} onChange={(e) => set(key, e.target.value)} {...props} />
    </label>
  )

  return (
    <form onSubmit={save} noValidate>
      <header className="bar">
        <button type="button" className="btn bar-btn" onClick={back}>← Cancel</button>
        <h1>{id ? 'Edit Machine' : 'New Machine'}</h1>
      </header>
      <main>
        {error && <p className="error" role="alert">{error}</p>}

        <section>
          <h2>Photo</h2>
          {url ? <img className="hero" src={url} alt="Machine" /> : <div className="noimg big" aria-hidden="true">🚜</div>}
          <input type="file" accept="image/*" capture="environment" hidden onChange={onPhoto} id="cam" />
          <input type="file" accept="image/*" hidden onChange={onPhoto} id="gal" />
          <div className="row2">
            <label className="btn" htmlFor="cam">📷 Take photo</label>
            <label className="btn" htmlFor="gal">🖼 Choose photo</label>
          </div>
          {url && <button type="button" className="btn danger-outline" onClick={() => set('photo', null)}>Remove photo</button>}
        </section>

        <section>
          <h2>Machine</h2>
          {field('Name *', 'name', { placeholder: 'e.g. Big Green Tractor', autoComplete: 'off' })}
          {field('Make', 'make', { placeholder: 'e.g. John Deere' })}
          {field('Model', 'model', { placeholder: 'e.g. 8320R' })}
          {field('Year', 'year', { inputMode: 'numeric', placeholder: 'e.g. 2016' })}
          {field('Serial number', 'serial')}
          {field('Engine hours', 'hours', { inputMode: 'decimal' })}
        </section>

        <section>
          <h2>Filters</h2>
          <datalist id="filter-labels">{FILTER_LABELS.map((l) => <option key={l} value={l} />)}</datalist>
          {m.filters.map((f) => (
            <div className="rowcard" key={f.id}>
              <label className="field"><span>Filter</span>
                <input list="filter-labels" value={f.label} onChange={(e) => setRow('filters', f.id, { label: e.target.value })} placeholder="e.g. Engine oil" />
              </label>
              <label className="field"><span>Part number</span>
                <input value={f.partNumber} onChange={(e) => setRow('filters', f.id, { partNumber: e.target.value })} placeholder="e.g. RE504836" autoCapitalize="characters" autoComplete="off" />
              </label>
              <button type="button" className="btn danger-outline" onClick={() => delRow('filters', f.id)}>Remove filter</button>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => addRow('filters', { label: '', partNumber: '' })}>+ Add filter</button>
        </section>

        <section>
          <h2>Fluids</h2>
          <datalist id="fluid-labels">{FLUID_LABELS.map((l) => <option key={l} value={l} />)}</datalist>
          {m.fluids.map((f) => (
            <div className="rowcard" key={f.id}>
              <label className="field"><span>Where</span>
                <input list="fluid-labels" value={f.label} onChange={(e) => setRow('fluids', f.id, { label: e.target.value })} placeholder="e.g. Engine oil" />
              </label>
              <label className="field"><span>Fluid type</span>
                <input value={f.type} onChange={(e) => setRow('fluids', f.id, { type: e.target.value })} placeholder="e.g. 15W-40 diesel" />
              </label>
              <label className="field"><span>Capacity</span>
                <input value={f.capacity} onChange={(e) => setRow('fluids', f.id, { capacity: e.target.value })} placeholder="e.g. 7 gal" />
              </label>
              <button type="button" className="btn danger-outline" onClick={() => delRow('fluids', f.id)}>Remove fluid</button>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => addRow('fluids', { label: '', type: '', capacity: '' })}>+ Add fluid</button>
        </section>

        <section>
          <h2>Notes</h2>
          <label className="field">
            <span className="sr">Notes</span>
            <textarea rows="4" value={m.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything else worth remembering" />
          </label>
        </section>
      </main>
      <div className="actionbar">
        <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Machine'}</button>
      </div>
    </form>
  )
}
