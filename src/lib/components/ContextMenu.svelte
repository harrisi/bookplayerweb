<script lang='ts'>
  import { settings } from '$lib/settings'
  import { onDestroy, onMount } from "svelte"
  import type { MouseEventHandler } from 'svelte/elements'

  let contextMenu: HTMLDivElement
  interface ContextMenuItem {
    text: string,
    action?: MouseEventHandler<any>,
    disabled?: boolean,
  }

  let opts: ContextMenuItem[] = []

  const item = (text: string, action?: MouseEventHandler<any>, disabled?: boolean): ContextMenuItem => ({
    text,
    action,
    disabled,
  })

  let itemOpts = [
    item('Rename', target => {
      console.dir(target)
    }),
    item('Move', undefined, true),
    item('Download', undefined, true),
    item('Remove download', undefined, true),
    item('Set artwork', undefined, true),
  ]

  let libraryOpts = [
    item('New folder', undefined, true),
    item('Import here', undefined, true),
    item('Sort', undefined, true),
    item('View', undefined, true), // grid or list
  ]

  onMount(() => {
    document.addEventListener('click', hideMenu)
    document.addEventListener('contextmenu', rightClick)
  })

  onDestroy(() => {
    document.removeEventListener('click', hideMenu)
    document.removeEventListener('contextmenu', rightClick)
  })

  const hideMenu = (e: MouseEvent) => {
    if (contextMenu && e.button == 0)
      contextMenu.style.display = "none"
  }

  const rightClick = (e: MouseEvent) => {
    if (!($settings.general.contextMenu.opt || e.detail) || e.shiftKey) {
      return
    } else {
      if (contextMenu.style.display == 'block') {
        hideMenu(e)
      }

      let target = e.target as HTMLElement
      if (e.detail || target.classList.contains('item')) {
        opts = itemOpts
      } else if (target.classList.contains('library')) {
        opts = libraryOpts
      } else if (target.classList.contains('cm')) {
        e.preventDefault()
        return
      } else {
        opts = []
        return
      }

      e.preventDefault()

      contextMenu.style.display = 'block';
      contextMenu.style.left = (e.detail ? e.detail.pageX : e.pageX) + "px"
      contextMenu.style.top = (e.detail ? e.detail.pageY : e.pageY) + "px"
    }
  }
</script>

<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div bind:this={contextMenu} id="contextMenu" class="context-menu cm" style="display: none">
  <ul class="menu cm">
    {#each opts as opt}
      <li class='{opt.text} cm'><button on:click={opt.action} class='cm {opt.disabled ? 'disabled' : ''}'>{opt.text}</button></li>
    {/each}
  </ul>
</div>

<style>
  button {
    cursor: pointer;
  }

  ul {
    list-style: none;
    margin: 0;
  }

  .context-menu { 
    position: absolute; 
    z-index: 2;
  } 

  .menu {
    display: flex;
    flex-direction: column;
    background-color: var(--secondarySystemBackground);
    border-radius: 10px;
    box-shadow: 0 10px 20px rgb(64 64 64 / 5%);
    padding: 10px 0;
  }

  .menu > li > button {
    font: inherit;
    border: 0;
    padding: 10px 30px 10px 15px;
    width: 100%;
    display: flex;
    align-items: center;
    position: relative;
    text-decoration: unset;
    color: var(--primary);
    font-weight: 500;
    transition: 0.5s linear;
    -webkit-transition: 0.5s linear;
    -moz-transition: 0.5s linear;
    -ms-transition: 0.5s linear;
    -o-transition: 0.5s linear;
    background-color: var(--secondarySystemBackground);
  }

  .menu > li > button:hover:not(.disabled) {
    background: var(--tertiarySystemBackground);
    color: var(--accent);
  }

  button.cm.disabled {
    background-color: gray;
    text-decoration: line-through;
    cursor: not-allowed;
  }

  button.cm {
    color: var(--primary);
  }
</style>