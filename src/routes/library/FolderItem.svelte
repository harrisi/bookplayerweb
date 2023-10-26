<script lang='ts'>
  export let item: Item

  import { settings } from '$lib/settings'
  import type { Item } from '$lib/types'
  import { formatTime } from '$lib/util';
  import Percent from './Percent.svelte'

  $: thumbnailCSS = item.thumbnail ? `--thumbnail: url(${item.thumbnail})` : void 0

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
      <input readonly type='text' class='item title' on:click|preventDefault|stopPropagation={console.log} bind:value={item.title}/>
      <div class='item details'>{item.details}</div>
    </div>
    <Percent percentCompleted={item.percentCompleted ?? 0} relativePath={item.relativePath} />
    <button style='{!$settings.general.contextMenu.opt ? 'display: inline !important;' : ''}' class='item' on:click|preventDefault|stopPropagation={emitEvent}>
      <p>...</p>
    </button>
  </div>
</div>

<style>
  input[type=text] {
    font-size: 100%;
    font-family: inherit;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    border: none;
    background: none;
    user-select: none;
    -webkit-user-select: none;
  }

  input[type=text]:focus {
    /* display: none; */
  }

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
    background-size: cover;
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

  #text * {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>