<script lang='ts'>
  import { onMount } from 'svelte'

  let contextMenu: HTMLDivElement

  onMount(() => {
    document.addEventListener('click', hideMenu)
    document.addEventListener('contextmenu', rightClick)
  })

  const hideMenu = () => {
    contextMenu.style.display = "none"
  }

  const rightClick = (e: MouseEvent) => {
    console.dir(e)
    if (e.shiftKey) {
      // e.target?.dispatch(e)
    } else {
      e.preventDefault()

      if (contextMenu.style.display == 'block'){
        hideMenu()
      }else{
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + "px"
        contextMenu.style.top = e.pageY + "px"
      }
    }
  }
</script>

<div bind:this={contextMenu} id="contextMenu" class="context-menu" style="display: none"> 
  <ul class="menu"> 
      <li class="rename"><a href="#"><i class="fa fa-pencil" aria-hidden="true"></i> Rename</a></li> 
      <li class="copy"><a href="#"><i class="fa fa-copy" aria-hidden="true"></i> Copy to</a></li> 
      <li class="paste"><a href="#"><i class="fa fa-paste" aria-hidden="true"></i> Move to</a></li> 
      <li class="download"><a href="#"><i class="fa fa-download" aria-hidden="true"></i> Download</a></li> 
      <li class="trash"><a href="#"><i class="fa fa-trash" aria-hidden="true"></i> Delete</a></li> 
  </ul> 
</div>

<style>
  ul {
    list-style: none;
  }

  .context-menu { 
    position: absolute; 
    z-index: 2;
  } 

  .menu {
    display: flex;
    flex-direction: column;
    background-color: #fff;
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
    color: #000;
    font-weight: 500;
    transition: 0.5s linear;
    -webkit-transition: 0.5s linear;
    -moz-transition: 0.5s linear;
    -ms-transition: 0.5s linear;
    -o-transition: 0.5s linear;
  }

  .menu > li > a:hover {
    background:#f1f3f7;
    color: #4b00ff;
  }

  .menu > li > a > i {
    padding-right: 10px;
  }

  .menu > li.trash > a:hover {
    color: red;
  }
</style>