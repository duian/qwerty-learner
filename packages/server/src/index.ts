// Server entry point placeholder
// To be implemented in subsequent tasks
import express from 'express'

const app = express()
const PORT = process.env.PORT ?? 3001

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
