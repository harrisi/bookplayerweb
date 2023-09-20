<script lang='ts'>
  import { page } from '$app/stores'
  import { apiCall } from '$lib'
  import { sync } from '$lib/sync'
  import FolderItem from './FolderItem.svelte'
  import Player from '../player/+page.svelte'
  import { goto } from '$app/navigation';
  const { token } = $page.data
  if (!token) goto('/')
  let items: any[]
  let root: any[]
  let player: any

  const loadRoot = async () => {
    // we don't want to set `sign` because this modifies the ETag.
    const resp = await apiCall('GET', '/library', null, token)

    root = items = resp.content
  }

  const folderClick = async (title: string) => {
    // we don't want to set `sign` because this modifies the ETag.
    const resp = await apiCall('GET', `/library?relativePath=${encodeURIComponent(title)}/`, null, token)
    items = resp.content
  }

  const setPlayer = async (item: {relativePath: string}) => {
    // if an update was made by the player, we need to refetch it. if not, this will just hit the cache
    // there are better ways to do this.
    const resp = await apiCall('GET', `/library?relativePath=${encodeURIComponent(item.relativePath)}`, null, token).then(res => res.content[0])
    item = resp
    await sync(item.relativePath, token)
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
