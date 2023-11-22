<script lang='ts'>
  // import Upload from './upload/+page.svelte'
  import { browser } from '$app/environment'
  import { afterNavigate } from '$app/navigation'
  import Overlay from '$lib/components/Overlay.svelte'
  import ContextMenu from '$lib/components/ContextMenu.svelte'
  import { page } from '$app/stores'
  import Popover from '$lib/components/Popover.svelte'

  let token = browser && localStorage.getItem('token')
  afterNavigate(() => {
    token = localStorage.getItem('token')
  })

  $: popover = $page.url.search === '?about'
</script>

<svelte:head>
  <link rel="manifest" href="manifest.json" />
  <meta name="apple-itunes-app" content="app-id=1138219998">
  <meta name="theme-color" content="#FAFAFA" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#202225" media="(prefers-color-scheme: dark)">
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</svelte:head>

<div id='betaHeader'>
  <p>
    This is beta software. Please <a class='betaLink' href='https://github.com/TortugaPower/bookplayerweb/issues' target='_blank'>file issues on GitHub</a>,
    or <a class='betaLink' href={`mailto:support@bookplayer.app?subject=${encodeURIComponent('BookPlayer web support')}`}>send an email to support@bookplayer.app</a>.
  </p>
  <p>
    Thanks for testing!
  </p>
</div>

{#if popover}
  <Popover />
{/if}

<Overlay --top=5px>
  <header>
    <nav>
      <div id='logoContainer'>
        <img src='logo.png' alt='bookplayer logo' />
        <span id="logo">BookPlayer</span>
      </div>
      <div id='headerControls'>
        <div id="about">
          <a class='headerButton' href='?about'>
            <span class="material-symbols-outlined">info</span>
            About
          </a>
        </div>
        <div id='library'>
          <a class='headerButton' href='/library'>
            <span class='material-symbols-outlined'>library_books</span>
            Library
          </a>
        </div>
        <div id='settings'>
          <a class='headerButton' href='/settings'>
            <span class='material-symbols-outlined'>settings</span>
            Settings
          </a>
        </div>
        <div id='loginout'>
          <a class='headerButton' href='/' on:click={() => localStorage.removeItem('token')} id="logout">
            <span class='material-symbols-outlined'>door_open</span>
            {#if token}
              Logout
            {:else}
              <div id="login">Login</div>
            {/if}
          </a>
        </div>
      </div>
    </nav>
  </header>
</Overlay>

<!-- <Upload /> -->

<div class='container'>
  <slot />
</div>

<ContextMenu />

<style>
  a.betaLink {
    text-decoration: underline;
  }

  a {
    outline: none;
    text-decoration: none;
    border-radius: 3px;
  }

  a:link {
    color: inherit;
  }

  a:visited {
    color: inherit;
  }

  a:focus {
    text-decoration: none;
    background: var(--secondary);
  }

  a:hover {
    text-decoration: none;
    background: var(--secondary);
  }

  a:active {
    background: var(--accent);
    color: var(--primary);
  }

  .material-symbols-outlined {
    font-variation-settings:
    'FILL' var(--fill),
    'wght' 400,
    'GRAD' 0,
    'opsz' 24
  }

  div.container {
    display: grid;
  }

  div#headerControls {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  a.headerButton {
    display: grid;
    grid-template-rows: 1fr auto;
    padding: 5px;
    margin: 5px;
    justify-content: space-evenly;
  }

  div#logoContainer {
    height: inherit;
    justify-self: baseline;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
  }

  img {
    object-fit: contain;
    max-height: 10vh;
  }

  header {
    width: 100%;
  }

  nav {
    display: flex;
    height: 10vh;
    justify-content: space-between;
    align-items: center;
    text-align: center;
  }

  #betaHeader {
    display: grid;
    grid-template-rows: 1fr 1fr;
    background-color: var(--accent);
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  #betaHeader p {
    text-align: center;
    margin: 0;
  }

  :global(body) {
    margin: 0;
    min-height: 100vh;
    background-color: var(--systemBackground);
    color: var(--primary);
  }

  :root {
    --lightPrimary: #242320;
    --lightSecondary: #8F8E95;
    --lightAccent: #3488D1;
    --lightSeparator: #DCDCDC;
    --lightSystemBackground: #FAFAFA;
    --lightSecondarySystemBackground: #FCFBFC;
    --lightTertiarySystemBackground: #E8E7E9;
    --lightSystemGroupedBackground: #EFEEF0;
    --lightSystemFill: #87A0BA;
    --lightSecondarySystemFill: #87A0BA;
    --lightTertiarySystemFill: #3488D1;
    --lightQuaternarySystemFill: #3488D1;

    --darkPrimary: #fafbfc;
    --darkSecondary: #8F8E94;
    --darkAccent: #459EEC;
    --darkSeparator: #434448;
    --darkSystemBackground: #202225;
    --darkSecondarySystemBackground: #111113;
    --darkTertiarySystemBackground: #333538;
    --darkSystemGroupedBackground: #2C2D30;
    --darkSystemFill: #647E98;
    --darkSecondarySystemFill: #707176;
    --darkTertiarySystemFill: #459EEC;
    --darkQuaternarySystemFill: #459EEC;
  }

  @media (prefers-color-scheme: light) {
    :root {
      --primary: var(--lightPrimary);
      --secondary: var(--lightSecondary);
      --accent: var(--lightAccent);
      --separator: var(--lightSeparator);
      --systemBackground: var(--lightSystemBackground);
      --secondarySystemBackground: var(--lightSecondarySystemBackground);
      --tertiarySystemBackground: var(--lightTertiarySystemBackground);
      --systemGroupedBackground: var(--lightSystemGroupedBackground);
      --systemFill: var(--lightSystemFill);
      --secondarySystemFill: var(--lightSecondarySystemFill);
      --tertiarySystemFill: var(--lightTertiarySystemFill);
      --quaternarySystemFill: var(--lightQuaternarySystemFill);
      --fill: 0;
    }
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --primary: var(--darkPrimary);
      --secondary: var(--darkSecondary);
      --accent: var(--darkAccent);
      --separator: var(--darkSeparator);
      --systemBackground: var(--darkSystemBackground);
      --secondarySystemBackground: var(--darkSecondarySystemBackground);
      --tertiarySystemBackground: var(--darkTertiarySystemBackground);
      --systemGroupedBackground: var(--darkSystemGroupedBackground);
      --systemFill: var(--darkSystemFill);
      --secondarySystemFill: var(--darkSecondarySystemFill);
      --tertiarySystemFill: var(--darkTertiarySystemFill);
      --quaternarySystemFill: var(--darkQuaternarySystemFill);
      --fill: 0;
    }
  }

  :root { font-family: 'Inter', sans-serif; }
  @supports (font-variation-settings: normal) {
    :root { font-family: 'Inter var', sans-serif; }
  }
</style>