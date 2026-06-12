import { handleUpload } from '@vercel/blob/client'

/* Issues short-lived client tokens so the browser uploads files
   directly to Vercel Blob (originals, no compression, any size). */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!process.env.EDIT_PASSWORD || clientPayload !== process.env.EDIT_PASSWORD) {
          throw new Error('Not authorised to upload')
        }
        return {
          allowedContentTypes: ['image/*', 'video/*'],
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {},
    })
    return res.status(200).json(jsonResponse)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
