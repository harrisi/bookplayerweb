<script>
  import { page } from '$app/stores'
  import { apiCall, library } from '$lib'
  import { sync } from '$lib/sync'
  import FolderItem from './FolderItem.svelte'
  import Player from '../player/+page.svelte'
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { version } from '$app/environment'
  const { token } = $page.data
  if (!token) goto('/')
  let items
  let root
  let player

  const getSynced = async () => {
    /** @type {string[]} */
    const resp = await apiCall('GET', '/library/keys', null, token)
      .then(res => res.content)

    resp.forEach(e => sync(e, token))
    // sync(resp[0], token)
  }

  const loadRoot = async () => {
    // we don't want to set `sign` because this modifies the ETag.
    const resp = await apiCall('GET', '/library', null, token)

    root = items = resp.content
  }

  /** @param title {string} */
  const folderClick = async title => {
    // we don't want to set `sign` because this modifies the ETag.
    const resp = await apiCall('GET', `/library?relativePath=${encodeURIComponent(title)}/`, null, token)
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

  onMount(getSynced)
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
