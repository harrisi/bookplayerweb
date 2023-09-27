<script lang='ts'>
  export let relativePath: string
  export let percentCompleted: number
  import { getStore, createWritable } from "$lib/store";

  let store = getStore(relativePath, percentCompleted)
  $: percentCSS = `--percentCompleted: ${$store}%`
</script>

<span class='percent' style={percentCSS}></span>

<style>
  .percent {
    display: flex;
    justify-content: center;
    align-items: center;
    float: right;

    width:  15px;
    height: 15px;
    border-radius: 50%;
    background:
    radial-gradient(closest-side, transparent 70%, var(--systemBackground) 70% 85%, var(--secondarySystemFill) 85% 100%),
    conic-gradient(var(--secondarySystemFill) var(--percentCompleted), var(--tertiarySystemBackground) 0);
  }
</style>