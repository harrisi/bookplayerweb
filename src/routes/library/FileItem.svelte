<script lang='ts'>
  import type { Item } from '$lib/types'
  import { onMount } from 'svelte'
  export let item: Item
  import Percent from './Percent.svelte'
  import { library } from '$lib/api'
  import { settings } from '$lib/settings'
  import process from 'process'
  import { parseReadableStream } from 'music-metadata-browser'
  import type { Observer } from 'music-metadata/lib/type'

  window.process = process

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
    thumbnailCSS = (url || item.thumbnail) ? `--thumbnail: url(${url || item.thumbnail})` : undefined
  }

  onMount(async () => {
    let content = await library.getContent({
      relativePath: item.relativePath,
      sign: true,
      noLastItemPlayed: true,
    }).then(res => res.content[0])

    const controller = new AbortController()
    const signal = controller.signal

    const getExtension = (s: string) => `.${s.split('.').at(-1)}`

    const observer: Observer = update => {
      if (update.tag.id === 'picture') {
        thumbnail = update.tag.value.data
        controller.abort('picture')
      }
    }

    await fetch(content.url, {
      mode: 'cors',
      signal,
    }).then(async resp => {
      if (!resp.body) return

      return await parseReadableStream(resp.body, getExtension(item.originalFileName ?? ''), { skipPostHeaders: true, observer })
      .catch(() => {})
    })
    .catch(() => {})

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