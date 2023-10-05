<script lang='ts'>
  import { library } from '$lib/api'
  import { sync } from '$lib/sync'
  import FolderItem from './FolderItem.svelte'
  import FileItem from './FileItem.svelte'
  import Player from '../player/+page.svelte'
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment'
  let token = browser ? localStorage.getItem('token') : ''
  if (!token && browser) goto('/')
  let items: any[]
  let root: any[]
  let player: any

  const loadRoot = async () => {
    // we don't want to set `sign` because this modifies the ETag.
    const resp = await library.getContent({})

    root = items = resp.content
    setPlayer(resp.lastItemPlayed)
  }

  const folderClick = async (title: string) => {
    // we don't want to set `sign` because this modifies the ETag.
    const resp = await library.getContent({relativePath: `${title}/`})
    items = resp.content
  }

  const setPlayer = async (item: {relativePath: string}) => {
    // if an update was made by the player, we need to refetch it. if not, this will just hit the cache
    // there are better ways to do this.
    const resp = await library.getContent({relativePath: item.relativePath, sign: true})
    .then(res => res.content[0])
    item = resp
    console.log(item)
    // await sync(item.relativePath)
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
  {#each items as item (item.relativePath)}
    {#if item.type == 0}
      <button on:click={() => folderClick(item.title)}>
        <FolderItem {...item}></FolderItem>
      </button>
    {:else if item.type == 2}
      <button class='fi' on:click={() => setPlayer(item)}>
        <FileItem {...item}></FileItem>
      </button>
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
  button {
    background-color: inherit;
    color: inherit;
  }

  button#home {
    height: 10vh;
  }
</style>
