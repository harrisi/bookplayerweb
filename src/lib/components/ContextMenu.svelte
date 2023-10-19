<script lang='ts'>
  import { onDestroy, onMount } from "svelte"

  let contextMenu: HTMLDivElement
  interface ContextMenuItem {
    text: string,
    action?: Function
  }

  let opts: ContextMenuItem[] = []

  const item = (text: string, action?: Function): ContextMenuItem => ({
    text,
    action,
  })

  let itemOpts = [
    item('Rename'),
    item('Move'),
    item('Download'),
    item('Remove download'),
  ]

  let libraryOpts = [
    item('New folder'),
    item('Import here'),
    item('Sort'),
    item('View'), // grid or list
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
    if (e.shiftKey) {
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
      <!-- svelte-ignore a11y-invalid-attribute -->
      <li class='{opt.text} cm'><a href='#' class='cm'>{opt.text}</a></li>
    {/each}
    <!-- <li class="rename"><a href="#"><i class="fa fa-pencil" aria-hidden="true"></i> Rename</a></li>
    <li class="copy"><a href="#"><i class="fa fa-copy" aria-hidden="true"></i> Copy to</a></li>
    <li class="paste"><a href="#"><i class="fa fa-paste" aria-hidden="true"></i> Move to</a></li>
    <li class="download"><a href="#"><i class="fa fa-download" aria-hidden="true"></i> Download</a></li>
    <li class="trash"><a href="#"><i class="fa fa-trash" aria-hidden="true"></i> Delete</a></li>  -->
  </ul>
</div>

<style>
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

  .menu > li > a {
    font: inherit;
    border: 0;
    padding: 10px 30px 10px 15px;
    /* width: 100%; */
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
  }

  .menu > li > a:hover {
    background: var(--tertiarySystemBackground);
    color: var(--accent);
  }

  a {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }
</style>