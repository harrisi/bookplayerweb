<div class='overlay'>
  <slot />
</div>

<style>
  .overlay {
    display: flex;
    align-items: center;
    position: sticky;
    top: calc(var(--top) + 32px);
    bottom: var(--bottom);
    margin: 8px;
    z-index: 1;
    background-color: var(--systemBackground);
    border-radius: 8px;
    box-shadow: 0px 10px 15px rgba(0,0,0, 0.1), 0px 4px 6px rgba(0,0,0, 0.05);
    opacity: 1;
  }
</style>
