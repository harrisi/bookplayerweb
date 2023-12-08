<script lang='ts'>
    import { goto } from "$app/navigation"
    import { page } from "$app/stores"
    import { onMount } from "svelte"

  let container: HTMLDivElement
  onMount(() => {
    container.addEventListener('click', () => {
      goto($page.url.pathname)
    })
  })
</script>

<div class='container' bind:this={container}>
  <slot />
</div>

<style>
  .container {
    z-index: 10;
    position: absolute;
    margin: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 95%;
    background-color: green;
  }
</style>