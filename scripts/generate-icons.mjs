import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let value = n;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(name, data) {
  const type = Buffer.from(name);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([length, type, data, checksum]);
}

function createIcon(size) {
  const rows = [];
  for (let y = 0; y < size; y += 1) {
    const row = Buffer.alloc(1 + size * 3);
    for (let x = 0; x < size; x += 1) {
      const nx = (x - size / 2) / (size / 2);
      const ny = (y - size / 2) / (size / 2);
      const radius = Math.hypot(nx, ny);
      let color = [9, 11, 24];
      if (Math.max(Math.abs(nx), Math.abs(ny)) < 0.82) color = [17, 27, 53];
      if (Math.abs(radius - 0.62) < 0.025) color = [140, 92, 255];
      if (Math.abs(radius - 0.46) < 0.032) color = [72, 240, 209];
      if (Math.abs(ny + nx * 0.9) < 0.055 && nx > -0.48 && nx < 0.5) color = [235, 255, 251];
      if (radius < 0.12) color = [239, 71, 112];
      row.set(color, 1 + x * 3);
    }
    rows.push(row);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from('\x89PNG\r\n\x1a\n', 'binary'),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

mkdirSync('public', { recursive: true });
for (const [size, filename] of [[180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
  writeFileSync(`public/${filename}`, createIcon(size));
}
console.log('Generated PWA icons in public/');
