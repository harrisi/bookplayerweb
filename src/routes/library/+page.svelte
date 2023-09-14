<script>
  import { page } from "$app/stores"
  import { apiCall } from "$lib"
  import FolderItem from "./FolderItem.svelte"
  import Player from '../player/+page.svelte'
  const { token } = $page.data
  let items
  let root
  let player

  const loadRoot = async () => {
    const resp = await apiCall('GET', '/library?sign=true', null, token)

    root = items = resp.content
  }

  /** @param title {string} */
  const folderClick = async title => {
    const resp = await apiCall('GET', `/library?sign=true&relativePath=${encodeURIComponent(title)}/`, null, token)
    items = resp.content
  }

  const setPlayer = item => {
    const audio = document.querySelector('audio')
    if (audio) {
      audio.src = ''
      audio.load()
    }
    player = item
  }
</script>

{#await loadRoot()}
loading..
{:then _}
  <button id="home" on:click={() => items = root}>home</button>
  {#each items as item}
    {#if item.type == 0}
      <button on:click={() => folderClick(item.title)}>
        <FolderItem details={item.details} title={item.title}></FolderItem>
      </button>
    {:else if item.type == 2}
      <button id='setPlayer' on:click={() => setPlayer(item)}>{item.title}</button>
    {/if}
  {/each}
{:catch err}
  {err}
{/await}

{#if player}
  {#key player.relativePath}
    <Player {...player} />
  {/key}
{/if}

<style>
  button#home {
    height: 10vh;
  }
</style>