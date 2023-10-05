<script lang='ts'>
  import '../app.css'
  // import Upload from './upload/+page.svelte'
  import { browser } from "$app/environment";
  import { afterNavigate } from "$app/navigation";

  let token = browser && localStorage.getItem('token')
  afterNavigate(() => {
    token = localStorage.getItem('token')
  })
</script>

<svelte:head>
  <link rel="manifest" href="manifest.json" />
</svelte:head>

<header>
  <nav>
    <div id="logo">BookPlayerWeb</div>
    <div id="about">About</div>
    {#if token}
      <a href='/' on:click={() => localStorage.removeItem('token')} id="logout">Logout</a>
    {:else}
      <div id="login">Login</div>
    {/if}
  </nav>
</header>

<!-- <Upload /> -->

<div>
  <slot />
</div>

<style>
  div {
    display: grid;
    justify-content: center;
    align-items: center;
  }

  a {
    display: grid;
    justify-content: center;
    align-items: center;
    color: var(--primary);
  }

  nav {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr;
    border: 1px solid black;
    height: 10vh;
  }

  nav > * {
    border: 1px solid red;
  }

  :global(body) {
    margin: 0;
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
    }
  }
</style>