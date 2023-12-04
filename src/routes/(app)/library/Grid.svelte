<script lang='ts'>
  import { fade } from "svelte/transition"
  import { onDestroy, onMount } from "svelte"
  import type { Item } from "$lib/types"

  export let items: Item[]

  let grid: HTMLDivElement

  const swapItems = (fromIndex, toIndex) => {
    [items[fromIndex], items[toIndex]] = [items[toIndex], items[fromIndex]]
    // Update any necessary metadata here
  }

  function handleDragStart(e: DragEvent, index: number) {
    console.log('drag')
    e.dataTransfer.effectAllowed = "move"
    // e.dataTransfer.setData("text/plain", index.toString())
    e.currentTarget.style.opacity = "0.4"
  }

  function handleDrop(e: DragEvent, index: number) {
    e.preventDefault()
    // const fromIndex = parseInt(e.dataTransfer.getData("text/plain"))
    // swapItems(e.target.id, index)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
  }

  function handleDragEnd(e: DragEvent) {
    e.currentTarget.style.opacity = "1"
  }

  onMount(() => {
    let index = 0
    for (let child of grid.children) {
      child.addEventListener("dragstart", e => handleDragStart(e, index))
      // child.addEventListener("dragenter", handleDragEnter)
      child.addEventListener("dragover", handleDragOver)
      // child.addEventListener("dragleave", handleDragLeave)
      child.addEventListener("drop", e => handleDrop(e, index))
      child.addEventListener("dragend", handleDragEnd)
      index++
    }
  })

  // onDestroy(() => {
  //   let index = 0
  //   for (let child of grid.children) {
  //     child.removeEventListener("dragstart", handleDragStart)
  //     child.removeEventListener("dragenter", handleDragEnter)
  //     child.removeEventListener("dragover", handleDragOver)
  //     child.removeEventListener("dragleave", handleDragLeave)
  //     child.removeEventListener("drop", handleDrop)
  //     child.removeEventListener("dragend", handleDragEnd)
  //     index++
  //   }
  // })
</script>

<div bind:this={grid} class='grid library' transition:fade>
  <slot />
  <!-- {#each items as item, index (item.id)}
    <div
      class="grid-item"
      draggable="true"
      on:dragstart={(e) => handleDragStart(e, index)}
      on:dragover={handleDragOver}
      on:drop={(e) => handleDrop(e, index)}
      on:dragend={handleDragEnd}
      style="opacity: 1;">
    </div>
  {/each} -->
</div>

<!-- <style>
  #grid {
    /* Existing styles */
  }
  .grid-item {
    /* Styles for individual grid items */
  }
</style> -->


<!-- <script lang='ts'>
  import { library } from "$lib/api"
  import type { Item } from "$lib/types"
  import { onDestroy, onMount } from "svelte"
  import { fade } from "svelte/transition"

  export let items: Item[]

  let grid: HTMLDivElement

  let dragSrcEl: HTMLElement

  function handleDragStart(e: DragEvent) {
    if (!e.target) return
    let target = e.target as HTMLElement
    target.style.opacity = "0.4"
    dragSrcEl = target
    if (e.dataTransfer)
      e.dataTransfer.effectAllowed = "move"
  }

  function handleDragOver(e: DragEvent) {
    if (e.preventDefault) {
      e.preventDefault()
    }
    if (e.dataTransfer)
      e.dataTransfer.dropEffect = 'move'
    return false
  }

  function handleDragEnter(e: DragEvent) {
    if (e.target)
      (e.target as HTMLElement).classList.add("over")
  }

  function handleDragLeave(e: DragEvent) {
    if (e.target)
      (e.target as HTMLElement).classList.remove("over")
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()

    let target = (e.target as HTMLElement)
    if (dragSrcEl != target) {
      let from = parseInt(target.id)
      let to = parseInt(dragSrcEl.id)
      ;[
        items[from].orderRank,
        items[to].orderRank,
      ] = [
        items[to].orderRank,
        items[from].orderRank,
      ]
      let start = Math.min(from, to)
      let end = Math.max(from, to)
      for (let i = start; i <= end; i++) {
        // library.updateMetadata(items[i])
      }
      // library.updateMetadata(items[from])
      // library.updateMetadata(items[to])

      target.replaceWith(target, dragSrcEl)
    }
    return false
  }

  function handleDragEnd(e: DragEvent) {
    (e.target as HTMLElement).style.opacity = "1"
    grid.childNodes.forEach(function(item) {
      if ((item as HTMLElement).classList)
        (item as HTMLElement).classList.remove("over")
    })
  }

  onMount(() => {
    for (let child of grid.children) {
      child.addEventListener("dragstart", handleDragStart)
      child.addEventListener("dragenter", handleDragEnter)
      child.addEventListener("dragover", handleDragOver)
      child.addEventListener("dragleave", handleDragLeave)
      child.addEventListener("drop", handleDrop)
      child.addEventListener("dragend", handleDragEnd)
    }
  })

  onDestroy(() => {
    for (let child of grid.children) {
      child.removeEventListener("dragstart", handleDragStart)
      child.removeEventListener("dragenter", handleDragEnter)
      child.removeEventListener("dragover", handleDragOver)
      child.removeEventListener("dragleave", handleDragLeave)
      child.removeEventListener("drop", handleDrop)
      child.removeEventListener("dragend", handleDragEnd)
    }
  })
</script> -->
<!-- 
<div bind:this={grid} id='grid' class='library' transition:fade>
  <slot />
</div> -->

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-auto-rows: auto;
    gap: 24px;
    margin: 24px;
  }

  @media screen and (max-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media screen and (min-width: 769px) and (max-width: 1175px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* .flex {
    display: flex;
    flex-wrap: wrap;
    flex: 1 1 0px;
    gap: 8px;
    margin: 8px;
  } */

  div * {
    user-select: none;
  }

</style>