<script lang='ts'>
  import Overlay from "$lib/components/Overlay.svelte"
</script>

<div class='rootContainer'>

<div id='betaHeader'>
  <p>
    This is beta software. Please <a class='betaLink' href='https://github.com/TortugaPower/bookplayerweb/issues' target='_blank'>file issues on GitHub</a>,
    or <a class='betaLink' href={`mailto:support@bookplayer.app?subject=${encodeURIComponent('BookPlayer web support')}`}>send an email to support@bookplayer.app</a>.
    Thanks for testing!
  </p>
</div>
<slot />

</div>

<svelte:head>
  <link rel="manifest" href="manifest.json" />
  <meta name="apple-itunes-app" content="app-id=1138219998">
  <meta name="theme-color" content="#FAFAFA" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#202225" media="(prefers-color-scheme: dark)">
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</svelte:head>

<style>
  .rootContainer {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
  }

  a.betaLink {
    text-decoration: underline;
  }

  :global(a) {
    outline: none;
    text-decoration: underline;
    border-radius: 3px;
  }

  :global(a:link) {
    color: inherit;
  }

  :global(a:visited) {
    color: inherit;
  }

  :global(a:focus) {
    text-decoration: none;
    background: var(--secondary);
  }

  :global(a:hover) {
    text-decoration: none;
    background: var(--secondary);
  }

  :global(a:active) {
    background: var(--accent);
    color: var(--primary);
  }

  #betaHeader {
    width: 100%;
    background-color: var(--accent);
    text-align: center;
    padding-bottom: 2px;
    padding-top: 2px;
    position: sticky;
    top: 0;
    z-index: 2;
    height: 2rem;
    display: grid;
    align-items: center;
  }

  #betaHeader p {
    text-align: center;
    margin: 0;
    color: white;
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