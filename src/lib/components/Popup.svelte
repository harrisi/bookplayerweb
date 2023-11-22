<script lang='ts'>
  import { onMount } from 'svelte'

  export let showing: { top: number, left: number } | undefined
  export let title = 'Control'

  let container: HTMLDivElement

  onMount(() => {
    container.style.top = `${showing!.top}px`
    container.style.left = `${showing!.left}px`

    const f = () => {
      showing = undefined
    }

    document.addEventListener('click', f, { once: true })

    return () => {
      document.removeEventListener('click', f)
    }
  })
</script>

<div class='container' bind:this={container}>
  <div class='controls'>
    <button class='x' on:click|preventDefault={() => showing = undefined}>x</button>
    <p>
      {title}
    </p>
  </div>
  <slot />
</div>

<style>
  .container {
    display: grid;
    grid-template-rows: 1fr auto;
    z-index: 10;
    position: absolute;
    transform: translate(-50%, -120%);
    border-radius: 5px;
    padding: 5px;
    background-color: var(--tertiarySystemBackground);
    gap: 0.25rem;
    justify-content: center;
  }

  div.controls {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
    align-items: center;
  }

  p {
    color: var(--primary);
    margin: 0;
  }

  .container::after {
    content: "";
    position: absolute;
    /* want this slightly inset so there's no weird rendering gaps */
    bottom: -19px;
    left: 50%;
    margin-left: -10px;
    border-width: 10px;
    border-style: solid;
    border-color: var(--tertiarySystemBackground) transparent transparent transparent;
    pointer-events: none;
  }

  button {
    cursor: pointer;
  }
</style>