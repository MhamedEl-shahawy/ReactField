/**
 * Rasterizes public/favicon.svg to PNG sizes referenced in _app.jsx.
 * Run after changing favicon.svg: node scripts/generate-favicons.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const svgPath = path.join(root, 'public', 'favicon.svg')
const svg = fs.readFileSync(svgPath)

const outputs = [
  { size: 16, file: 'favicon-16x16.png' },
  { size: 32, file: 'favicon-32x32.png' },
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 192, file: 'android-chrome-192x192.png' },
  { size: 512, file: 'android-chrome-512x512.png' },
]

for (const { size, file } of outputs) {
  const out = path.join(root, 'public', file)
  const kernel =
    size <= 32 ? sharp.kernel.nearest : sharp.kernel.lanczos3
  await sharp(svg, { density: 240 })
    .resize(size, size, { kernel })
    .png()
    .toFile(out)
  console.log('wrote', file)
}
