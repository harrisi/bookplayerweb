<script lang='ts'>
  import { library } from '$lib/api'
  import type { Item } from '$lib/types'

  export let item: Item
  const onClick = e => {
    document.querySelector('audio')!.currentTime = parseInt(e.target.parentNode.id)
  }
</script>

{#await library.getBookmarks(item)}
  loading..
{:then bookmarks}
  {#each bookmarks as bookmark (bookmark.time)}
    <ul>
      {#if bookmark.active}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li on:click={onClick} id={bookmark.time.toString()}>
          <p>note: {bookmark.note}</p>
          <p>at: {bookmark.time}</p>
        </li>
      {/if}
    </ul>
  {/each}
{:catch err}
  {err}
{/await}

<style>

</style>