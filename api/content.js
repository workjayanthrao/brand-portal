import { put, list } from '@vercel/blob'

const PATH = 'content.json'

/* GET  -> latest published content (from Blob)
   POST -> publish content (requires x-edit-password header) */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: PATH, limit: 1 })
      if (!blobs.length) return res.status(404).json({ error: 'No published content yet' })
      const r = await fetch(`${blobs[0].url}?ts=${Date.now()}`, { cache: 'no-store' })
      if (!r.ok) return res.status(502).json({ error: 'Could not read published content' })
      const data = await r.json()
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      if (!process.env.EDIT_PASSWORD || req.headers['x-edit-password'] !== process.env.EDIT_PASSWORD) {
        return res.status(401).json({ error: 'Wrong edit password' })
      }
      const data = req.body
      if (!data || !Array.isArray(data.brands)) {
        return res.status(400).json({ error: 'Invalid content shape' })
      }
      await put(PATH, JSON.stringify(data), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 60,
      })
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
