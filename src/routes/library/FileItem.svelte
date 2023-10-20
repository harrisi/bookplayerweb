<script lang='ts'>
  import type { Item } from '$lib/types'
  import { onMount } from 'svelte'
  export let item: Item
  import Percent from './Percent.svelte'
  import { library } from '$lib/api'
  import { Buffer } from 'buffer'
  import { read } from 'node-id3'
  import { settings } from '$lib/settings'

  window.Buffer = Buffer

  let thumbnail: Buffer | undefined

  const formatTime = (n: number) => {
    const hours = Math.floor(n / 3600),
      minutes = Math.floor((n % 3600) / 60),
      seconds = Math.floor(n % 60),
      parts = []

    if (hours > 0) parts.push(String(hours).padStart(2, '0'))
    if (minutes > 0 || hours > 0) parts.push(String(minutes).padStart(2, '0'))
    parts.push(String(seconds).padStart(2, '0'))

    return parts.join(':')
  }

  let thumbnailCSS: string | undefined

  $: {
    let url = thumbnail && URL.createObjectURL(new Blob([thumbnail]))
    thumbnailCSS = (url || item.thumbnail) ? `--thumbnail: url(${thumbnail ? url : item.thumbnail})` : undefined
  }

  onMount(async () => {
    if (!item.relativePath.toLowerCase().endsWith('.mp3')) return

    let content = await library.getContent({
      relativePath: item.relativePath,
      sign: true,
      noLastItemPlayed: true,
    }).then(res => res.content[0])

    // let url = typeof content === 'string' ? content : content.url
    // let tagsMM = mm.fetchFromUrl(url, { skipPostHeaders: true })
    // .then(meta => {
    //   if (meta.common.picture) {
    //     thumbnail = mm.selectCover(meta.common.picture)?.data
    //   }
    // })
    // .catch(err => {
    //   if (err.message === 'Failed to determine audio format') {
    //     // oh well?
    //   }
    //   return null
    // })

    let firstFrame = await fetch(content.url, {
      headers: {
        Range: 'bytes=0-9',
      },
    }).then(res => res.blob())

    // console.log(item.relativePath)
    let maybeID3 = await firstFrame.slice(0, 3).text()
    // console.log('maybeID3', maybeID3)
    if (maybeID3 !== 'ID3') return
    let sizeBuf = await firstFrame.slice(6, 10).arrayBuffer()
    let sizeView = new Int8Array(sizeBuf)
    let bin = [...sizeView].map(n => n.toString(2).padStart(8, '0').slice(1)).join('')
    // console.log('bin', bin)
    // console.log('binVal', parseInt(bin, 2))
    let fullID3 = await fetch(content.url, {
      headers: {
        Range: `bytes=0-${parseInt(bin, 2)}`,
      }
    }).then(res => res.arrayBuffer())

    let tags = read(Buffer.from(fullID3))
    // console.dir(tags)
    if (typeof tags.image === 'object') {
      thumbnail = tags.image.imageBuffer
    }
  })

  const emitEvent = (e: MouseEvent) => {
    document.dispatchEvent(new CustomEvent('contextmenu', {
      ...e,
      detail: {
        pageX: e.pageX,
        pageY: e.pageY,
      }
    }))
  }

</script>

<div id='container' class='item'>
  <div id='artwork' class='item' style={thumbnailCSS}>
    <div class='item duration'>{formatTime(item.duration ?? 0)}</div>
  </div>
  <div id='info' class='item'>
    <div id='text' class='item'>
      <div class='item title'>{item.title}</div>
      <div class='item details'>{item.details}</div>
    </div>
    <Percent percentCompleted={item.percentCompleted ?? 0} relativePath={item.relativePath} />
    <button style='{!$settings.general.contextMenu.opt ? 'display: inline !important;' : ''}' class='item' on:click|preventDefault|stopPropagation={emitEvent}>
      <p>...</p>
    </button>
  </div>
</div>

<style>
  div#container{
    display: grid;
    height: 100%;
    border-radius: 8px;
    justify-content: stretch;
    align-items: end;
    font-size: medium;
    grid-template-rows: 4fr 1fr;
  }

  div#artwork {
    background: var(--thumbnail, linear-gradient(#37398c, #537bc4)) no-repeat;
    border-radius: 8px 8px 0px 0px;
    background-size: contain;
    display: flex;
    justify-content: end;
    align-items: end;
    aspect-ratio: 1;
  }

  div#artwork .duration {
    margin: 10px;
    padding: 3px;
    background-color: var(--systemBackground);
    border-radius: 5px;
    opacity: 75%;
    position: absolute;
  }

  div#info {
    display: grid;
    justify-items: center;
    align-items: center;
    height: 100%;
    grid-template-columns: 3fr 1fr auto;
  }

  div#info button {
    padding: 5px;
    margin: 5px;
  }

  @media screen and (min-width: 1175px) {
    div#info button {
      display: none;
    }
  }

  div#info #text {
    display: grid;
    grid-template-rows: 2fr 1fr;
    height: 0;
    min-height: 100%;
  }

  @media screen and (max-width: 1175px) {
    #text * {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
</style>