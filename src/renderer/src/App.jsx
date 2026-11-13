import { useState, useEffect } from 'react'
import SubnetTab from './components/SubnetTab'

export default function App() {
  const [tab, setTab] = useState('v4')
  const [pinned, setPinned] = useState(true)
  useEffect(() => {
  window.api?.setWidth(tab === 'v6' ? 660 : 360)
}, [tab])

  const togglePin = () => {
    window.api.setPin(!pinned)
    setPinned(!pinned)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 8,
        boxSizing: 'border-box',
        fontFamily: 'Consolas, monospace',
        fontSize: 12
      }}
    >
      <div className="topbar">
        <button className={`tab ${tab === 'v4' ? 'on' : ''}`} onClick={() => setTab('v4')}>
          IPv4
        </button>
        <button className={`tab ${tab === 'v6' ? 'on' : ''}`} onClick={() => setTab('v6')}>
          IPv6
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={togglePin}
          title="Always on top"
          className="pin"
          style={{
            background: pinned ? '#4cc2ff' : '#2b2b2b',
            opacity: pinned ? 1 : 0.6
          }}
        >
          {pinned ? '📌 On' : '📌 Off'}
        </button>
      </div>

      <SubnetTab
        version="v4"
        active={tab === 'v4'}
        defaultValue="10.99.0.0/24"
        defaultSplit="29"
      />
      <SubnetTab
        version="v6"
        active={tab === 'v6'}
        defaultValue="2001:db8::/32"
        defaultSplit="48"
      />
    </div>
  )
}