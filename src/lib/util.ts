import { Buffer } from "node:buffer"
import { parseBuffer, type IAudioMetadata } from 'music-metadata-browser'
import { library, storage } from "./api"
import type { Item } from "./types"
import NodeID3, { read } from "node-id3"
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { settings } from './settings'
import { get } from 'svelte/store'

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

const ffmpeg = new FFmpeg()
const beta = get(settings).experimental.apiBeta.opt

const initFFmpeg = async () => {
  if (ffmpeg.loaded) return;
  console.log('init ffmpeg')

  await ffmpeg.load({
    coreURL: `${window.location.origin}/js/ffmpeg-core.js`,
    wasmURL: `${window.location.origin}/js/ffmpeg-core.wasm`,
    workerURL: `${window.location.origin}/js/ffmpeg-core.worker.js`,
  })

}

const getExtension = (s: string) => `.${s.split('.').at(-1)}`

const getMime = (s: string) => {
  s = getExtension(s)
  const obj = (mimeType: string) => ({ mimeType })
  switch (s) {
    case '.mp3': return obj('audio/mpeg')

    case '.mp4':
    case '.m4a':
    case '.m4p':
    case '.m4b':
    case '.m4r':
    case '.m4v':
      return obj('audio/mp4')
    default:
    return obj('') 
  }
}

const getID3Metadata = (path: string, data: Uint8Array) => {
  return read(Buffer.from(data))
}

const getMP4Metadata = async (path: string, data: Uint8Array) => {
  return await parseBuffer(data, getMime(path))
}

type FileData = Uint8Array

interface IFFMetadata {
  ffmetadata: FileData
  ffmetadataArtwork: FileData
}

const getFFMetadata = async (path: string, data: Uint8Array) => {
  await initFFmpeg()

  const pathParts = path.split('/')
  const dirs = pathParts.slice(0, -1)
  const file = pathParts.at(-1)
  if (!file) return

  const lastDotIndex = file.lastIndexOf('.')!
  const fileName = file.slice(0, lastDotIndex)
  const metadataFile = `${dirs.join('/')}${dirs.length ? '/' : ''}${fileName}.metadata`

  console.log('creating dirs')
  dirs.forEach(async (part, index, arr) => {
    console.log(`creating ${arr.slice(0, index).join('/')}`)
    await ffmpeg.createDir(arr.slice(0, index).join('/'))
  })
  console.log(`writing file ${file}`)
  await ffmpeg.writeFile(file, data)
  console.log('execing')
  await ffmpeg.exec([
    '-i', path,
    '-f', 'ffmetadata',
    metadataFile,
  ])
  console.log(`wrote file ${metadataFile}`)

  console.log(`reading file ${metadataFile}`)
  const ffmetadata = await ffmpeg.readFile(metadataFile)

  await ffmpeg.exec(`-i ${path} -an -vcodec copy art.png`.split(' '))
  const ffmetadataArtwork = await ffmpeg.readFile('art.png')
  return { ffmetadata, ffmetadataArtwork, }
}

const fetchMP3 = async (item: Item) => {
  console.log('fetchmp3')
  if (!item.url) return;

  const token = localStorage.getItem('token')!

  const headers = new Headers()
  headers.set('Range', `bytes=0-9`)
  if (beta) headers.set('Authorization', `Bearer ${token}`)

  let firstFrame = await fetch(item.url, {
    mode: 'cors',
    headers,
  }).then(res => res.blob())

  let maybeID3 = await firstFrame.slice(0, 3).text()
  if (maybeID3 !== 'ID3') return

  let sizeBuf = await firstFrame.slice(6, 10).arrayBuffer()
  let sizeView = new Uint8Array(sizeBuf)
  let bin = [...sizeView].map(n => n.toString(2).padStart(8, '0').slice(1)).join('')

  headers.set('Range', `bytes=0-${parseInt(bin, 2) + 10}`)

  return await fetch(item.url, {
    mode: 'cors',
    headers,
  }).then(async res => new Uint8Array(await res.arrayBuffer()))
}

const fetchMP4 = async (item: Item) => {
  console.log('fetchmp4')
  const token = localStorage.getItem('token')!

  let boxStart = 0

  let boxes: Uint8Array[] = []

  for (let i = 0; i < 10; i++) {
    console.log('fetch mp4 loop')
    const headers = new Headers()
    if (beta) headers.set('Authorization', `Bearer ${token}`)
    headers.set('Range', `bytes=${boxStart}-${boxStart + 7}`)
    const boxSize = await fetch(item.url!, {
      mode: 'cors',
      headers,
    }).then(resp => {
      if (resp.ok)
        return resp.arrayBuffer()
    }).catch(console.error)

    if (!boxSize) break

    let sizeView = new DataView(boxSize)
    let size = sizeView.getUint32(0)
    let decoder = new TextDecoder()
    let type = decoder.decode(boxSize.slice(4))
    boxes.push(new Uint8Array(boxSize))
    if (type == 'mdat') {
      if (size > 8) {
        boxes.push(new Uint8Array(size - 8))
      }

      boxStart += size

      continue
    }

    if (size <= 8) {
      boxStart += size
      continue
    }

    headers.set('Range', `bytes=${boxStart + 8}-${boxStart + size - 1}`)

    let boxData = await fetch(item.url!, {
      mode: 'cors',
      headers,
    }).then(resp => {
      if (resp.ok)
        return resp.arrayBuffer()
    })

    if (!boxData) break
    boxes.push(new Uint8Array(boxData))

    boxStart += size
  }

  const flatten2DUint8Array = (arrs: Uint8Array[]) => {
    const length = arrs.reduce((accum, cur) => accum + cur.length, 0)
    const flatArr = new Uint8Array(length)

    let offset = 0
    arrs.forEach(arr => {
      flatArr.set(arr, offset)
      offset += arr.length
    })

    return flatArr
  }

  let flatBoxes = flatten2DUint8Array(boxes)

  return flatBoxes
}

const getMetadata = async (item: Item) => {
  const ffmpegSetting = get(settings).experimental.ffmpeg.opt

  if (ffmpegSetting)
    initFFmpeg()

  if (!item.url) {
    item = await library.getContent({
      relativePath: item.relativePath,
      sign: true,
      noLastItemPlayed: true,
    }).then(res => res.content[0])
  }

  if (!item.url) return

  let mime = getMime(item.relativePath)
  let fetchFn = mime.mimeType === 'audio/mpeg' ? fetchMP3 : fetchMP4

  const metadataRaw = await fetchFn(item)
  if (!metadataRaw) return;

  const getNodeMetadata = mime.mimeType === 'audio/mpeg' ? getID3Metadata : getMP4Metadata
  const getMetadataFn = ffmpegSetting ? getFFMetadata : getNodeMetadata

  const metadata = await getMetadataFn(item.relativePath, metadataRaw)

  if (!metadata) return;

  if (ffmpegSetting) {
    const metaFF: IFFMetadata = metadata as IFFMetadata
    const metaArr = metaFF.ffmetadata as Uint8Array
    const d = new TextDecoder()
    const meta = d.decode(metaArr)
    return { meta, artwork: metaFF.ffmetadataArtwork, }
  } else {
    if (mime.mimeType === 'audio/mpeg') {
      const meta = metadata as NodeID3.Tags
      const artwork = meta.image && typeof meta.image !== 'string' ? meta.image.imageBuffer : meta.image
      return { meta, artwork, }
    } else {
      const meta = metadata as IAudioMetadata
      const artwork = meta.common.picture && meta.common.picture[0].data
      return { meta: metadata, artwork, }
    }
  }
}

export {
  formatTime,
  getMetadata,
}