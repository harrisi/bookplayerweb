<script lang='ts'>
  export let title: string
  export let details: string
  export let currentTime: number
  export let duration: number
  export let percentCompleted: number
  $: percentCSS = `--percentCompleted: ${percentCompleted}%`
</script>

<span class='title'>{title}</span>
<span class='details'>{details}</span>
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