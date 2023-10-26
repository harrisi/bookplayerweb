import { Buffer } from "buffer"
import { parseReadableStream } from "music-metadata-browser"
import { library } from "./api"
import type { Item } from "./types"
import type { Observer } from "music-metadata/lib/type"
import { read } from "node-id3"

window.Buffer = Buffer

const formatTime = (n: number) => {
  const hours = Math.floor(n / 3600),
    minutes = Math.floor((n % 3600) / 60),
    seconds = Math.floor(n % 60),
    parts = []

  if (hours > 0) parts.push(String(hours).padStart(2, '0'))
  parts.push(String(minutes).padStart(2, '0'))
  parts.push(String(seconds).padStart(2, '0'))

  return parts.join(':')
}

const getID3Chapters = async (item: Item) => {
  if (!item.url) return;

  let firstFrame = await fetch(item.url, {
    headers: {
      Range: 'bytes=0-9',
    },
  }).then(res => res.blob())

  let maybeID3 = await firstFrame.slice(0, 3).text()
  if (maybeID3 !== 'ID3') return

  let sizeBuf = await firstFrame.slice(6, 10).arrayBuffer()
  let sizeView = new Int8Array(sizeBuf)
  let bin = [...sizeView].map(n => n.toString(2).padStart(8, '0').slice(1)).join('')

  let fullID3 = await fetch(item.url, {
    headers: {
      Range: `bytes=0-${parseInt(bin, 2) + 10}`,
    }
  }).then(res => res.arrayBuffer())

  let tags = read(Buffer.from(fullID3))

  return tags.chapter
}

interface ObserverFactory {
  (controller: AbortController): Observer
}

const getMetadata = async (item: Item, observerFactory?: ObserverFactory, id3Chapter?: boolean) => {
  const getExtension = (s: string) => `.${s.split('.').at(-1)}`

  let res
  if (!item.url) {
    item = await library.getContent({
      relativePath: item.relativePath,
      sign: true,
      noLastItemPlayed: true,
    }).then(res => res.content[0])
  }

  if (!item.url) return;

  if (id3Chapter) {
    return await getID3Chapters(item)
  }

  if (!observerFactory) return;

  const controller = new AbortController()
  const signal = controller.signal

  const observer = observerFactory(controller)

  await fetch(item.url, {
    mode: 'cors',
    signal,
  }).then(async resp => {
    if (!resp.body) return

    await parseReadableStream(resp.body, getExtension(item.originalFileName ?? ''), { includeChapters: true, skipPostHeaders: true, observer })
    .catch(() => {})
  })
  .catch(() => {})

  return res
}

export {
  formatTime,
  getMetadata,
}