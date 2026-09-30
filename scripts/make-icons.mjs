// One-time helper: turns public/icon.svg into the PNG icons phones need.
import sharp from 'sharp'
for (const size of [192, 512]) {
  await sharp('public/icon.svg').resize(size, size).png().toFile(`public/icon-${size}.png`)
}
