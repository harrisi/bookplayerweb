<script lang='ts'>
    import { library } from "$lib/api"
  import type { Item } from "$lib/types"
  import { onDestroy, onMount } from "svelte"
  import { fade } from "svelte/transition"

  export let items: Item[]

  let grid: HTMLDivElement

  let dragSrcEl = null;

  function handleDragStart(e) {
    this.style.opacity = "0.4";
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = "move";
    return false;
  }

  function handleDragEnter(e) {
    this.classList.add("over");
  }

  function handleDragLeave(e) {
    this.classList.remove("over");
  }

  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (dragSrcEl != this) {
      let from = parseInt(this.id)
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
      for (let i = from; i <= to; i++) {
        library.updateMetadata(items[i])
      }
      // library.updateMetadata(items[from])
      // library.updateMetadata(items[to])

      this.replaceWith(this, dragSrcEl);
    }
    return false;
  }

  function handleDragEnd(e) {
    this.style.opacity = "1";
    grid.childNodes.forEach(function(item) {
      if (item.classList)
        item.classList.remove("over");
    });
  }

  onMount(() => {
    for (let child of grid.children) {
      child.addEventListener("dragstart", handleDragStart);
      child.addEventListener("dragenter", handleDragEnter);
      child.addEventListener("dragover", handleDragOver);
      child.addEventListener("dragleave", handleDragLeave);
      child.addEventListener("drop", handleDrop);
      child.addEventListener("dragend", handleDragEnd);
    }
  })

  onDestroy(() => {
    for (let child of grid.children) {
      child.removeEventListener("dragstart", handleDragStart);
      child.removeEventListener("dragenter", handleDragEnter);
      child.removeEventListener("dragover", handleDragOver);
      child.removeEventListener("dragleave", handleDragLeave);
      child.removeEventListener("drop", handleDrop);
      child.removeEventListener("dragend", handleDragEnd);
    }
  })
</script>

<div bind:this={grid} id='grid' class='library' transition:fade>
  <slot />
</div>

<style>
  #grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-auto-rows: auto;
    gap: 8px;
    margin: 8px;
  }

  @media screen and (max-width: 768px) {
    #grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media screen and (min-width: 769px) and (max-width: 1175px) {
    #grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  #flex {
    display: flex;
    flex-wrap: wrap;
    flex: 1 1 0px;
    gap: 8px;
    margin: 8px;
  }

  div * {
    user-select: none;
  }

</style>