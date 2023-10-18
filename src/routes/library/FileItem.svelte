<script lang='ts'>
  import type { Item } from '$lib/types'
  import { onMount } from 'svelte'
  export let item: Item
  import Percent from './Percent.svelte'
  import { library } from '$lib/api'
  import { Buffer } from 'buffer'
  import { read } from 'node-id3'
  import process from 'process'
  import { Stream } from 'stream'
  import * as mm from 'music-metadata-browser'

  window.Buffer = Buffer
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
    thumbnailCSS = (url || item.thumbnail) ? `--thumbnail: url(${thumbnail ? url : item.thumbnail})` : undefined
  }

  onMount(async () => {
    document.addEventListener('click', hideMenu)
    document.addEventListener('contextmenu', rightClick)
    // if (!item.relativePath.toLowerCase().endsWith('.mp3')) return

    let content = localStorage.getItem(`relativePath=${item.relativePath}`) ?? await library.getContent({
      relativePath: item.relativePath,
      sign: true,
      noLastItemPlayed: true,
    }).then(res => res.content[0])

    let url = typeof content === 'string' ? content : content.url
    let tagsMM = await mm.fetchFromUrl(url, { skipPostHeaders: true }).catch(console.error)

    if (tagsMM && tagsMM.common && tagsMM.common.picture) {
      thumbnail = mm.selectCover(tagsMM.common.picture)?.data
    }

    // let firstFrame = await fetch(content.url, {
    //   headers: {
    //     Range: 'bytes=0-9',
    //   },
    // }).then(res => res.blob())

    // console.log(item.relativePath)
    // let maybeID3 = await firstFrame.slice(0, 3).text()
    // console.log('maybeID3', maybeID3)
    // if (maybeID3 !== 'ID3') return
    // let sizeBuf = await firstFrame.slice(6, 10).arrayBuffer()
    // let sizeView = new Int8Array(sizeBuf)
    // let bin = [...sizeView].map(n => n.toString(2).padStart(8, '0').slice(1)).join('')
    // console.log('bin', bin)
    // console.log('binVal', parseInt(bin, 2))
    // let fullID3 = await fetch(content.url, {
    //   headers: {
    //     Range: `bytes=0-${parseInt(bin, 2)}`,
    //   }
    // }).then(res => res.arrayBuffer())

    // let tags = read(Buffer.from(fullID3))
    // console.dir(tags)
    // if (typeof tags.image === 'object') {
    //   thumbnail = tags.image.imageBuffer
    // }
  })

  function hideMenu() {
    document.getElementById("contextMenu")!.style.display = "none"
  }

  function rightClick(e) {
    if (e.shiftKey) {
      e.target.dispatch(e)
    } else {
      e.preventDefault()

      if (document.getElementById("contextMenu")!.style.display == "block"){
        hideMenu()
      }else{
        var menu = document.getElementById("contextMenu")!
        menu.style.display = 'block';
        menu.style.left = e.pageX + "px"
        menu.style.top = e.pageY + "px"
      }
    }
  }
</script>

<div id="contextMenu" class="context-menu" style="display: none"> 
  <ul class="menu"> 
      <li class="rename"><a href="#"><i class="fa fa-pencil" aria-hidden="true"></i> Rename</a></li> 
      <li class="copy"><a href="#"><i class="fa fa-copy" aria-hidden="true"></i> Copy to</a></li> 
      <li class="paste"><a href="#"><i class="fa fa-paste" aria-hidden="true"></i> Move to</a></li> 
      <li class="download"><a href="#"><i class="fa fa-download" aria-hidden="true"></i> Download</a></li> 
      <li class="trash"><a href="#"><i class="fa fa-trash" aria-hidden="true"></i> Delete</a></li> 
  </ul> 
</div>

<div id='container'>
  <div id='artwork' style={thumbnailCSS}>
    <div class='duration'>{formatTime(item.duration ?? 0)}</div>
  </div>
  <div id='info'>
    <div id='text'>
      <div class='title'>{item.title}</div>
      <div class='details'>{item.details}</div>
    </div>
    <Percent percentCompleted={item.percentCompleted ?? 0} relativePath={item.relativePath} />
    <button on:click|preventDefault|stopPropagation={console.log}>
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
    grid-template-rows: 3fr 1fr;
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

  div#info #text {
    display: grid;
    grid-template-rows: 2fr 1fr;
  }

  ul {
    list-style: none;
  }

  .context-menu { 
    position: absolute; 
    z-index: 2;
  } 

  .menu {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 10px 20px rgb(64 64 64 / 5%);
    padding: 10px 0;
  }

  .menu > li > a {
    font: inherit;
    border: 0;
    padding: 10px 30px 10px 15px;
    /* width: 100%; */
    display: flex;
    align-items: center;
    position: relative;
    text-decoration: unset;
    color: #000;
    font-weight: 500;
    transition: 0.5s linear;
    -webkit-transition: 0.5s linear;
    -moz-transition: 0.5s linear;
    -ms-transition: 0.5s linear;
    -o-transition: 0.5s linear;
  }

  .menu > li > a:hover {
    background:#f1f3f7;
    color: #4b00ff;
  }

  .menu > li > a > i {
    padding-right: 10px;
  }

  .menu > li.trash > a:hover {
    color: red;
  }
</style>