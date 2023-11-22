<script lang='ts'>
  import { onMount } from "svelte"

  export let min: number | string
  export let max: number | string
  export let step:number | string = 1
  export let value: number | undefined
  export let changing: boolean = false
  export let onChange: (e: Event) => void

  let el: HTMLInputElement

  const pointerDown = () => {
      console.log('changing = true')
      changing = true
      document.addEventListener('pointerup', () => {
        console.log('changing = false')
        changing = false
      }, {
        once: true,
      })
    }

  onMount(() => {
    el.addEventListener('pointerdown', pointerDown)

    return () => {
      el.removeEventListener('pointerdown', pointerDown)
    }
  })
</script>

<input bind:this={el} type='range' {min} {max} {step} bind:value on:change={onChange} />

<style>
  input[type='range'] {
  overflow: hidden;
  width: 100%;
  margin: 0;
  appearance: none;
  border-radius: 5px;
  background-color: var(--tertiarySystemBackground);
  cursor: pointer;
}

input[type='range']::-webkit-slider-runnable-track {
  height: 20px;
}

input[type='range']::-webkit-slider-thumb {
  width: 0;
  appearance: none;
  box-shadow: -50vw 0 0 50vw var(--accent);
}

input[type=range]::-moz-range-track {
    height: 20px;
    background: var(--tertiarySystemBackground);
}

input[type=range]::-moz-range-thumb {
    height: 20px;
    width: 0;
    background: var(--tertiarySystemBackground);
    border: none;
}

input[type="range"]::-moz-range-progress {
  background-color: var(--accent);
  height: 100%;
}
</style>