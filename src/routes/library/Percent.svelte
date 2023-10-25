<script lang='ts'>
  export let relativePath: string
  export let percentCompleted: number
  import { getStore } from "$lib/store";

  let store = getStore(relativePath, percentCompleted)
  $: percentCSS = `--percentCompleted: ${$store}%`
</script>

<div class='percent' style={percentCSS}></div>

<style>
  .percent {
    height: 25px;
    aspect-ratio: 1;
    border-radius: 50%;
    margin-right: 5px;
    background:
      radial-gradient(closest-side, transparent 70%, var(--systemBackground) 70% 85%, var(--secondarySystemFill) 85% 100%),
      conic-gradient(var(--secondarySystemFill) var(--percentCompleted), var(--tertiarySystemBackground) 0);
  }
</style>