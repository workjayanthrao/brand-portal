const KEY = 'brand-portal-data-v1'

export const PORTAL_PASSWORD = 'portal123'
export const EDIT_PASSWORD = 'edit123'

export const uid = () => Math.random().toString(36).slice(2, 10)

const LOREM_LEAD = `The brand starts here. From our brand to their doorstep, it’s about being a part of something bigger. This is where our journey toward more consistency begins. Let’s brand together.`
const LOREM_BODY = `It’s the job of every Amazonian to embody and continually live up to this single mission. Having one mission for all of Amazon helps us all work toward the same outcome. Although each of us contributes in different ways, the results are the same: to make Every Day Better for our customers.`

export const emptyMedia = () => null // media = { kind:'image'|'video', src, caption }

export const makeBlock = (type) => {
  const base = { id: uid(), type }
  switch (type) {
    case 'text': return { ...base, html: '', style: 'lead' }
    case 'image': return { ...base, media: null }
    case 'textImage': return { ...base, html: '', html2: '', media: null }
    case 'twoImage': return { ...base, media1: null, media2: null }
    case 'threeImage': return { ...base, media1: null, media2: null, media3: null }
    case 'section': return { ...base, title: 'Section title', blocks: [] }
    case 'dodont': return { ...base, units: 2, items: [ddItem(true), ddItem(false)] }
    case 'callout': return { ...base, title: 'Callout title', linkPageId: '', blocks: [] }
    case 'note': return { ...base, html: '' }
    default: return base
  }
}
export const ddItem = (good) => ({ id: uid(), good, media: null, html: '' })

const page = (name, blocks = [], children = []) => ({ id: uid(), type: 'page', name, blocks, children })
const folder = (name, children = []) => ({ id: uid(), type: 'folder', name, children, open: true })

function seedAmazonNowPage() {
  return [
    { id: uid(), type: 'image', media: null },
    { id: uid(), type: 'text', html: LOREM_LEAD, style: 'lead' },
    {
      id: uid(), type: 'section', title: 'Pillars', blocks: [
        { id: uid(), type: 'text', html: LOREM_BODY, style: 'body' },
        { id: uid(), type: 'image', media: null },
        {
          id: uid(), type: 'callout', title: 'Callout title', linkPageId: '', blocks: [
            { id: uid(), type: 'text', html: LOREM_BODY, style: 'body' },
            { id: uid(), type: 'threeImage', media1: null, media2: null, media3: null },
            { id: uid(), type: 'text', html: LOREM_BODY, style: 'body' },
          ]
        },
      ]
    },
    {
      id: uid(), type: 'dodont', units: 3, items: [
        { id: uid(), good: true, media: null, html: 'It’s the job of every Amazonian to embody and continually live up to this single mission.' },
        { id: uid(), good: true, media: null, html: 'Having one mission for all of Amazon helps us all work toward the same outcome.' },
        { id: uid(), good: false, media: null, html: 'Although each of us contributes in different ways, the results are the same.' },
      ]
    },
    { id: uid(), type: 'note', html: LOREM_BODY },
    { id: uid(), type: 'image', media: { kind: 'none', src: '', caption: LOREM_BODY.slice(0, 140) + '…' } },
  ]
}

function seed() {
  return {
    brands: [
      {
        id: uid(), name: 'Amazon Now', logo: null, cardBg: '#FFFFFF', cardTextColor: '#0A202E', accent: '#00D0FA',
        tree: [
          folder('Folder 1', [
            page('Brand Guidelines', seedAmazonNowPage(), [
              page('Sub-category 1', [
                { id: uid(), type: 'text', html: LOREM_LEAD, style: 'lead' },
              ]),
            ]),
            page('Category 2', [
              { id: uid(), type: 'textImage', html: LOREM_LEAD, html2: LOREM_BODY, media: null },
            ]),
            page('Category 3', [
              { id: uid(), type: 'twoImage', media1: null, media2: null },
            ]),
          ]),
        ],
      },
      {
        id: uid(), name: 'Amazon Pay', logo: null, cardBg: '#FFD814', cardTextColor: '#0A202E', accent: '#FFD814',
        tree: [
          folder('Folder 1', [
            page('Brand Guidelines', [
              { id: uid(), type: 'text', html: LOREM_LEAD, style: 'lead' },
              { id: uid(), type: 'image', media: null },
            ]),
          ]),
        ],
      },
    ],
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* corrupted -> reseed */ }
  const d = seed()
  saveData(d)
  return d
}

export function saveData(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)) }
  catch (e) { console.warn('Save failed (storage may be full)', e) }
}

export function exportJSON(d) {
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'brand-portal-content.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

/* ---- tree helpers ---- */
export function flattenPages(tree, out = [], depth = 0) {
  for (const node of tree) {
    if (node.type === 'page') {
      out.push({ id: node.id, name: node.name, depth })
      if (node.children) flattenPages(node.children, out, depth + 1)
    } else if (node.children) {
      flattenPages(node.children, out, depth)
    }
  }
  return out
}

export function findPage(tree, pageId) {
  for (const node of tree) {
    if (node.type === 'page' && node.id === pageId) return node
    if (node.children) {
      const f = findPage(node.children, pageId)
      if (f) return f
    }
  }
  return null
}

export function firstPage(tree) {
  for (const node of tree) {
    if (node.type === 'page') return node
    if (node.children) {
      const f = firstPage(node.children)
      if (f) return f
    }
  }
  return null
}
