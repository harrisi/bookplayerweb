<script lang='ts'>
  import type { Item } from '$lib/types'
  export let item: Item
  import Percent from './Percent.svelte'

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

  $: thumbnailCSS = item.thumbnail ? `--thumbnail: url(${item.thumbnail})` : void 0
</script>

<div id='container'>
  <div id='artwork' style={thumbnailCSS}></div>
  <div id='info'>
    <div class='title'>{item.title}</div>
    <div class='details'>{item.details}</div>
    <div class='duration'>{formatTime(item.duration ?? 0)}</div>
    <Percent percentCompleted={item.percentCompleted ?? 0} relativePath={item.relativePath} />
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
    background-size: cover;
    height: 100%;
  }

  div#info {
    display: grid;
    justify-items: center;
    align-items: center;
    height: 100%;
    grid-template-columns: repeat(3, 1fr) auto;
  }
</style>