<script lang='ts'>
  export let item: Item

  import type { Item } from '$lib/types'
  import { onMount } from 'svelte'
  import { formatTime, getMetadata } from '$lib/util'
  import Percent from './Percent.svelte'
  import { settings } from '$lib/settings'
    import Slider from '../player/Slider.svelte'
    import { getStore } from '$lib/store'

  let thumbnail: ArrayBuffer | undefined
  let thumbnailCSS: string | undefined

  $: {
    let url = thumbnail && URL.createObjectURL(new Blob([thumbnail]))
    thumbnailCSS = (url || item.thumbnail) ? `--thumbnail: url(${url || item.thumbnail})` : undefined
  }

  onMount(async () => {
    try {
      let metadata = await getMetadata(item)
      if (metadata !== undefined) {
        thumbnail = metadata.artwork as Uint8Array
      }
      console.log('nothing')
    } catch (err) {
      console.error(err)
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

  let store = getStore(item.relativePath, item.percentCompleted)

</script>

<div class='container'>
  <div class='artwork' style={thumbnailCSS}></div>
  <div class='info'>
    <div class='text'>
      <div class='title'>{item.title}</div>
      <div class='details'>{item.details}</div>
    </div>
    <button style='{!$settings.general.contextMenu.opt ? 'display: inline !important;' : ''}' on:click|preventDefault|stopPropagation={emitEvent}>
      <p>...</p>
    </button>
  </div>
  <div class='progress'>
    <label>
      {Math.max(Math.min(100, (item.percentCompleted ?? 0)), 0).toFixed(2)}%
      <progress id='progress' max={item.duration} value={$store / 100 * (item.duration ?? 1)}></progress>
    </label>
  </div>
</div>

<style>
  label {
    visibility: hidden;
    height: 0px;
  }

  progress {
    visibility: visible;
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    /* background-color: #dcdcdc; */
    height: 5px;
    border-radius: 6px;
  }

  .progress {
    margin: 0px 7px 7px;
  }

  ::-webkit-progress-value {
    background-color: #ccc;
    border-radius: 6px;
  }

  ::-webkit-progress-bar {
    background-color: #fff;
    border-radius: 4px;
  }

  ::-moz-progress-bar {
    background-color: transparent;
  }

  .container {
    display: grid;
    height: 100%;
    border-radius: 8px;
    justify-content: stretch;
    align-items: end;
    font-size: medium;
    grid-template-rows: 4fr 1fr;
    position: relative;
    background-color: white;
  }

  .artwork {
    background: var(--thumbnail, linear-gradient(#37398c, #537bc4)) no-repeat;
    border-radius: 8px 8px 0px 0px;
    background-size: contain;
    display: flex;
    justify-content: end;
    align-items: end;
    aspect-ratio: 1;
  }

  .duration {
    margin: 10px;
    padding: 3px;
    background-color: var(--systemBackground);
    border-radius: 5px;
    opacity: 75%;
    position: absolute;
  }

  .info {
    display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
    height: 100%;
    grid-template-rows: 3fr 1fr auto;
    /* border-radius: 8px; */
    background-color: #fff;
  }

  .info .text {
    display: grid;
    grid-template-rows: 2fr 1fr;
    height: 0;
    min-height: 100%;
    width: 100%;
  }

  .info button {
    padding: 5px;
    margin: 5px;
  }

  @media screen and (min-width: 1175px) {
    .info button {
      display: none;
    }
  }

  @media screen and (max-width: 1175px) {
    .text * {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
</style>