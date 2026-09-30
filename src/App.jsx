import { useEffect } from 'react'
import { useRoute } from './useRoute.js'
import { requestPersistence } from './db.js'
import MachineList from './MachineList.jsx'
import MachineDetail from './MachineDetail.jsx'
import MachineForm from './MachineForm.jsx'

export default function App() {
  const route = useRoute()
  useEffect(() => {
    requestPersistence()
  }, [])

  if (route.name === 'new') return <MachineForm key="new" />
  if (route.name === 'edit') return <MachineForm key={route.id} id={route.id} />
  if (route.name === 'detail') return <MachineDetail key={route.id} id={route.id} />
  return <MachineList />
}
