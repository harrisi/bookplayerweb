<script lang='ts'>
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"

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
      this.replaceWith(this, dragSrcEl);
    }
    return false;
  }

  function handleDragEnd(e) {
    this.style.opacity = "1";
    items.forEach(function(item) {
      item.classList.remove("over");
    });
  }

  onMount(() => {
    for (let child of grid.children) {
      child.addEventListener("dragstart", handleDragStart, false);
      child.addEventListener("dragenter", handleDragEnter, false);
      child.addEventListener("dragover", handleDragOver, false);
      child.addEventListener("dragleave", handleDragLeave, false);
      child.addEventListener("drop", handleDrop, false);
      child.addEventListener("dragend", handleDragEnd, false);
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