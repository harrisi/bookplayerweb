<div id='overlay'>
  <slot />
</div>

<style>
  #overlay {
    display: flex;
    align-items: center;
    position: sticky;
    top: var(--top);
    bottom: var(--bottom);
    margin: 8px;
    z-index: 1;
    /* border-radius: 5px;
    box-shadow: 3px 3px 3px gray; */
    background-color: var(--systemBackground);
    border-radius: 8px;
    box-shadow: 0px 10px 15px rgba(0,0,0, 0.1), 0px 4px 6px rgba(0,0,0, 0.05);
    opacity: 1;
  }
</style>
