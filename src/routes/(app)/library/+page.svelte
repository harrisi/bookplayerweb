<script lang='ts'>
  import { library } from '$lib/api'
  import Player from '../player/Player.svelte'
  import { goto } from '$app/navigation'
  import { browser } from '$app/environment'
  import { ItemType, type Item } from '$lib/types'
  import { fade } from 'svelte/transition'
  import Grid from './Grid.svelte'
  import LibraryItem from './LibraryItem.svelte'

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

  const folderClick = async (item: Item) => {
    // we don't want to set `sign` because this modifies the ETag.
    const resp = await library.getContent({relativePath: `${item.title}/`}).then(res => res.content)
    items = resp
  }

  const volumeClick = async (item: Item) => {
    setPlayer(item)
  }

  const fileClick = async (item: Item) => {
    const withURL: Item[] = await library.getContent({
      relativePath: item.relativePath,
      sign: true,
    }).then(res => res.content)
    if (withURL.length !== 1) {
      throw new Error(`file click tried loading more than one file for ${item}`)
    }
    setPlayer(withURL[0])
  }

  const setPlayer = (item: Item) => {
    player = item
  }

  const itemClick = (item: Item) => {
    let fn
    switch (item.type) {
      case ItemType.File: fn = fileClick; break
      case ItemType.Folder: fn = folderClick; break
      case ItemType.Volume: fn = volumeClick; break
      default: fn = (item: Item) => console.log(item)
    }

    fn(item)
  }
</script>

{#await loadRoot()}
loading..
{:then _}
<div class='library'>
  <button id='home' on:click={loadRoot}>home</button>

  {#key items.toString()}
  <Grid bind:items>
  {#each [...items].sort((a, b) =>
    (a.orderRank ?? 0) - (b.orderRank ?? 0)
  ) as item, i (item.relativePath)}
    <button id={i.toString()} draggable="true" in:fade|global on:click={() => itemClick(item)}>
      <LibraryItem {item} />
    </button>
  {/each}
  </Grid>
  {/key}

</div>
{:catch err}
  {err}
{/await}

{#if player}
  {#key player.relativePath}
    <Player item={player} />
  {/key}
{/if}

<style>
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
