<script>
  export let data
  $: ({ token } = data)
</script>

<svelte:head>
  <link rel="manifest" href="manifest.json" />
</svelte:head>

<header>
  <nav>
    <div id="logo">BookPlayerWeb</div>
    <div id="about">About</div>
    {#if token}
      <a href='/auth/logout' id="logout">Logout</a>
    {:else}
      <div id="login">Login</div>
    {/if}
  </nav>
</header>

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
    --darkPrimary: #fafbfc;
    --darkSystemBackground: #202225;
    --darkSecondarySystemFill: #707176;
    --darkTertiarySystemBackground: #333538;

    --lightPrimary: #242320;
    --lightSystemBackground: #FAFAFA;
    --lightSecondarySystemFill: #87A0BA;
    --lightTertiarySystemBackground: #e8e7e9;
  }

  @media (prefers-color-scheme: light) {
    :root {
      --primary: var(--lightPrimary);
      --systemBackground: var(--lightSystemBackground);
      --secondarySystemFill: var(--lightSecondarySystemFill);
      --tertiarySystemBackground: var(--lightTertiarySystemBackground);
    }
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --primary: var(--darkPrimary);
      --systemBackground: var(--darkSystemBackground);
      --secondarySystemFill: var(--darkSecondarySystemFill);
      --tertiarySystemBackground: var(--darkTertiarySystemBackground);
    }
  }
</style>