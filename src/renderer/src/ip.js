export function parseV4(str) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(str)) return null
  const o = str.split('.').map(Number)
  if (o.some((x) => x > 255)) return null
  return o.reduce((a, x) => (a << 8n) + BigInt(x), 0n)
}

export function formatV4(n) {
  return [24n, 16n, 8n, 0n].map((s) => Number((n >> s) & 255n)).join('.')
}

export function parseV6(str) {
  if (!/^[0-9a-fA-F:.]+$/.test(str)) return null
  let s = str

  // embedded IPv4 at the end, e.g. ::ffff:1.2.3.4
  if (s.includes('.')) {
    const idx = s.lastIndexOf(':')
    const v4 = parseV4(s.slice(idx + 1))
    if (v4 === null) return null
    s = s.slice(0, idx + 1) + (v4 >> 16n).toString(16) + ':' + (v4 & 0xffffn).toString(16)
  }

  const parts = s.split('::')
  if (parts.length > 2) return null
  const head = parts[0] ? parts[0].split(':') : []
  const tail = parts.length === 2 && parts[1] ? parts[1].split(':') : []

  let groups
  if (parts.length === 2) {
    const missing = 8 - head.length - tail.length
    if (missing < 1) return null
    groups = [...head, ...Array(missing).fill('0'), ...tail]
  } else {
    groups = head
  }
  if (groups.length !== 8) return null

  let n = 0n
  for (const g of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null
    n = (n << 16n) + BigInt('0x' + g)
  }
  return n
}

export function formatV6(n) {
  const g = []
  for (let i = 7; i >= 0; i--) g.push(Number((n >> BigInt(i * 16)) & 0xffffn))

  // find the longest run of zero groups (length >= 2) to compress with ::
  let bestS = -1
  let bestL = 0
  for (let i = 0; i < 8; ) {
    if (g[i] === 0) {
      let j = i
      while (j < 8 && g[j] === 0) j++
      if (j - i > bestL) {
        bestS = i
        bestL = j - i
      }
      i = j
    } else i++
  }

  const h = g.map((x) => x.toString(16))
  if (bestL < 2) return h.join(':')
  return h.slice(0, bestS).join(':') + '::' + h.slice(bestS + bestL).join(':')
}

export const fmtCount = (n, exp) =>
  n < 1_000_000_000_000n ? n.toLocaleString() : `2^${exp}`

// input: "10.99.0.0/24" or "2001:db8::/32"   split: "29" / "48" / ""
export function parseNet(input, splitStr) {
  const [addr, cidr] = input.trim().split('/')
  const v6 = addr.includes(':')
  const bits = v6 ? 128 : 32
  const ip = v6 ? parseV6(addr) : parseV4(addr)
  const p = Number(cidr)

  if (ip === null || cidr === undefined || cidr === '' || !Number.isInteger(p) || p < 0 || p > bits)
    return null

  const s = splitStr.trim() === '' ? p : Number(splitStr)
  if (!Number.isInteger(s) || s < p || s > bits) return { error: `Split must be ${p}–${bits}` }

  const all = (1n << BigInt(bits)) - 1n
  const hostMask = (1n << BigInt(bits - p)) - 1n
  const net = ip & (all ^ hostMask)
  const last = net | hostMask
  const step = 1n << BigInt(bits - s)
  const fmt = v6 ? formatV6 : formatV4

  return {
    v6,
    bits,
    p,
    s,
    net,
    last,
    step,
    fmt,
    count: 1n << BigInt(s - p),
    countExp: s - p,
    hostExp: bits - s,
    mask: v6 ? null : formatV4(all ^ hostMask),
    perSubnet: v6 ? step : s >= 31 ? step : step - 2n
  }
}