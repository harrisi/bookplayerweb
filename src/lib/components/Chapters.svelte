<script lang='ts'>
  import { library } from '$lib/api'
  import type { Item } from '$lib/types'
    import { formatTime } from '$lib/util'

  export let item: Item
  export let chapters: any[]

  // this doesn't work for volumes :(
  const onClick = time => {
    document.querySelector('audio')!.currentTime = time
  }
</script>

<div class='container'>
  <ul>
    {#each chapters as chapter (chapter.elementID)}
      <li>
        <button on:click={() => onClick(chapter.startTimeMs / 1000)}>
          {(chapter.tags && chapter.tags.title) ? chapter.tags.title : chapter.elementID}
          {formatTime(chapter.startTimeMs / 1000)}
        </button>
      </li>
    {/each}
  </ul>
</div>

<!-- {#each chapters as chapter (chapter.startTimeMs)}
  <ul>
    <li on:click={() => onClick(chapter.startTimeMs / 1000)}>
      <p>note: {chapter.elementID}</p>
      <p>at: {chapter.startTimeMs}</p>
    </li>
  </ul>
{/each} -->

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->

<style>
  .container {
    height: 120px;
    overflow: auto;
  }
</style>