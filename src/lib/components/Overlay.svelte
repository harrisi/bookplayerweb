<div class='overlay'>
  <slot />
</div>

<style>
  .overlay {
    display: flex;
    align-items: center;
    position: sticky;
    top: calc(var(--top) + 2rem);
    bottom: var(--bottom);
    z-index: 1;
    background-color: var(--systemBackground);
    box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.10);
    opacity: 1;
  }
</style>
