<script lang='ts'>
  import type { Item } from '$lib/types'
  export let item: Item
  let {
    relativePath,
    title,
    details,
    percentCompleted = 0,
    thumbnail,
    duration = 1,
  } = item
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
</script>

<div>
  <img src={thumbnail?.toString()} alt={`${title} artwork thumbnail`} />
  <span class='title'>{title}</span>
  <span class='details'>{details}</span>
  <span class='duration'>{formatTime(duration)}</span>
  <Percent {percentCompleted} {relativePath} />
</div>

<style>
  img {
    height: min(5vh, 5vw);
    background: linear-gradient(#37398c, #537bc4);
    border-radius: 5px;
    aspect-ratio: 1;
  }

  div {
    display: grid;
    align-items: center;
    justify-items: center;
    grid-template-columns: repeat(5, 1fr);
  }
</style>