<script lang='ts'>
  import { library } from '$lib/api'
  import FolderItem from './FolderItem.svelte'
  import FileItem from './FileItem.svelte'
  import Player from '../player/+page.svelte'
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment'
  import { ItemType, type Item } from '$lib/types'
  import { fade } from 'svelte/transition';
  import Bookmarks from '$lib/components/Bookmarks.svelte'
  let token = browser ? localStorage.getItem('token') : ''
  if (!token && browser) goto('/')
  let items: Item[]
  let root: Item[]
  let player: Item

  const loadRoot = async () => {
    // we don't want to set `sign` because this modifies the ETag.
    const resp = await library.getContent({noLastItemPlayed: true})

    root = items = resp.content
    if (!player) {
      const lastItemPlayed = await library.getLastPlayed()
      setPlayer(lastItemPlayed)
    }
  }

  const folderClick = async (title: string) => {
    // we don't want to set `sign` because this modifies the ETag.
    const resp = await library.getContent({relativePath: `${title}/`}).then(res => res.content)
    items = resp
  }

  const setPlayer = async (item: {relativePath: string}) => {
    // if an update was made by the player, we need to refetch it. if not, this will just hit the cache
    // there are better ways to do this.
    const resp = await library.getContent({relativePath: item.relativePath, sign: true})
    .then(res => res.content[0])
    item = resp
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
  <button id='home' on:click={loadRoot}>home</button>
  <div id='grid' transition:fade>
  {#each items as item (item.relativePath)}
    {#if item.type !== ItemType.File}
      <button in:fade|global on:click={() => folderClick(item.title ?? '')}>
        <FolderItem {item}></FolderItem>
      </button>
    {:else if item.type === ItemType.File}
      <button in:fade|global on:click={() => setPlayer(item)}>
        <FileItem {item}></FileItem>
      </button>
    {/if}
  {/each}
  </div>
{:catch err}
  {err}
{/await}

{#if player}
  {#key player.relativePath}
    <Player item={player} />
    <Bookmarks item={player} />
  {/key}
{/if}

<style>
  #grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-auto-rows: auto;
    gap: 8px;
    margin: 8px;
  }

  @media screen and (max-width: 768px) {
    #grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media screen and (min-width: 769px) and (max-width: 1175px) {
    #grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  #flex {
    display: flex;
    flex-wrap: wrap;
    flex: 1 1 0px;
    gap: 8px;
    margin: 8px;
  }

  button {
    color: inherit;
    background-color: var(--systemBackground);
    border-radius: 8px;
    box-shadow: 0px 10px 15px rgba(0,0,0, 0.1), 0px 4px 6px rgba(0,0,0, 0.05);
    padding: 0;
    border-width: 0;
    cursor: pointer;
  }

  button#home {
    aspect-ratio: 1;
  }

  button#home {
    height: 10vh;
    margin: 5px;
  }
</style>
