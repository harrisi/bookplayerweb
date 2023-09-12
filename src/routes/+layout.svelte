<script>
  export let data
  const { token } = data
</script>

<header>
  <nav>
    <div id="logo">BookPlayerWeb</div>
    <div id="about">About</div>
    {#if token}
      <div id="profile">Profile</div>
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
  }
</style>