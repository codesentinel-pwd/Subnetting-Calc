import { useState, useRef, useEffect } from 'react'
import { parseNet, fmtCount } from '../ip'

const MAX_H = 10_000_000
const OVERSCAN = 5

const inputStyle = {
  background: '#2b2b2b',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: 4,
  padding: '6px 8px',
  fontFamily: 'Consolas, monospace',
  fontSize: 14,
  outline: 'none'
}

export default function SubnetTab({ version, active, defaultValue, defaultSplit }) {
  const isV6 = version === 'v6'
  const [value, setValue] = useState(defaultValue)
  const [split, setSplit] = useState(defaultSplit)
  const [copied, setCopied] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const [viewH, setViewH] = useState(400)
  const listRef = useRef(null)
  const savedTop = useRef(0)

  let r = parseNet(value, split)
  let wrongType = false
  if (r && !r.error && r.v6 !== isV6) {
    wrongType = true
    r = null
  }
  const hasList = !!r && !r.error
  const rowH = 28

  // track visible height (ignore 0 while the tab is hidden)
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (el.clientHeight > 0) setViewH(el.clientHeight)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [hasList])

  // restore the scroll position when coming back to this tab
  useEffect(() => {
    if (active && listRef.current) listRef.current.scrollTop = savedTop.current
  }, [active, hasList])

  // new input -> back to the top
  useEffect(() => {
    savedTop.current = 0
    if (listRef.current) listRef.current.scrollTop = 0
    setScrollTop(0)
  }, [value, split])

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 800)
  }

  // ---- virtual list math ----
  let totalH = 0
  let top = 0
  const items = []

  if (hasList) {
    const fullH = r.count * BigInt(rowH)
    const scaled = fullH > BigInt(MAX_H)
    totalH = scaled ? MAX_H : Number(fullH)
    const visible = Math.ceil(viewH / rowH) + 1

    let startIdx
    if (scaled) {
      const ratio = Math.min(1, Math.max(0, scrollTop / Math.max(1, totalH - viewH)))
      const span = r.count - BigInt(visible)
      const PREC = 1n << 40n
      startIdx = span > 0n ? (span * BigInt(Math.floor(ratio * 2 ** 40))) / PREC : 0n
      top = scrollTop
    } else {
      const startNum = Math.max(0, Math.floor(scrollTop / rowH) - OVERSCAN)
      startIdx = BigInt(startNum)
      top = startNum * rowH
    }

    let endIdx = startIdx + BigInt(visible + OVERSCAN * 2)
    if (endIdx > r.count) endIdx = r.count

    for (let i = startIdx; i < endIdx; i++) {
      const start = r.net + i * r.step
      items.push({ i, start: r.fmt(start), end: r.fmt(start + r.step - 1n) })
    }
  }

  return (
    <div
      style={{
        display: active ? 'flex' : 'none',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isV6 ? '2001:db8::/32' : '10.99.0.0/24'}
          style={{ ...inputStyle, flex: 1, minWidth: 0 }}
          autoFocus={active}
        />
        <span style={{ alignSelf: 'center', opacity: 0.6 }}>-s</span>
        <input
          value={split}
          onChange={(e) => setSplit(e.target.value)}
          placeholder={isV6 ? '48' : '29'}
          style={{ ...inputStyle, width: 44, textAlign: 'center' }}
        />
      </div>

      {!r && !wrongType && (
        <p style={{ opacity: 0.7 }}>
          Enter a network like {isV6 ? '2001:db8::/32' : '10.99.0.0/24'}
        </p>
      )}
      {wrongType && (
        <p style={{ color: '#ff6b6b' }}>
          This is the {isV6 ? 'IPv6' : 'IPv4'} tab. Use the {isV6 ? 'IPv4' : 'IPv6'} tab for that
          address.
        </p>
      )}
      {r && r.error && <p style={{ color: '#ff6b6b' }}>{r.error}</p>}

      {hasList && (
        <>
          <div style={{ margin: '10px 0 6px', lineHeight: 1.5, opacity: 0.85 }}>
            <div style={{ wordBreak: 'break-all' }}>
              Network {r.fmt(r.net)}/{r.p} — {r.fmt(r.last)}
            </div>
            {!isV6 && <div>Mask {r.mask}</div>}
            <div>
              {fmtCount(r.count, r.countExp)} × /{r.s} subnets, {fmtCount(r.perSubnet, r.hostExp)}{' '}
              {isV6 ? 'addresses' : 'hosts'} each
            </div>
          </div>

          <div className={`head ${isV6 ? 'wide' : ''}`}>
            <span>Network</span>
            <span></span>
            <span>{isV6 ? 'Last address' : 'Broadcast'}</span>
          </div>

          <div
            ref={listRef}
            className="list"
            onScroll={(e) => {
              const t = e.currentTarget.scrollTop
              if (active) savedTop.current = t
              setScrollTop(t)
            }}
          >
            <div style={{ height: totalH, position: 'relative' }}>
              <div style={{ position: 'absolute', top, left: 0, right: 0 }}>
                {items.map((row) => {
                  const key = `${row.start}/${r.s}`
                  return (
                    <div
                      key={String(row.i)}
                      className={`row ${isV6 ? 'wide' : ''} ${row.i % 2n ? 'alt' : ''} ${
                        copied === key ? 'copied' : ''
                      }`}
                      style={{ height: rowH - 2 }}
                      onClick={() => copy(key)}
                      title="Click to copy network/prefix"
                    >
                      <span>{row.start}</span>
                      <span className="dash">-</span>
                      <span>{row.end}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}