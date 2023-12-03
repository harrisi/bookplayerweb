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

<input bind:this={el} type='range' {min} {max} {step} bind:value on:change={onChange} list='markers' />

<datalist id="markers">
  <option value="0.5"></option>
  <option value="1"></option>
  <option value="2"></option>
  <option value="3"></option>
  <option value="4"></option>
</datalist>