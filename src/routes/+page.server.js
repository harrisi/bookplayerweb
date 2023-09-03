import { randomBytes } from 'crypto'

export function load() {
  return { nonce: randomBytes(16).toString('base64') }
}