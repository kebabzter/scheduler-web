import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Scheduler from'./Scheduler/Scheduler.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
                <Scheduler></Scheduler>
      </div>
    </>
  )
}

export default App
