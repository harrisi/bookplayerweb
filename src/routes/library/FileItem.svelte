<script lang='ts'>
  export let relativePath: string
  export let title: string
  export let details: string
  export let percentCompleted: number
  import Percent from "./Percent.svelte";
</script>

<span class='title'>{title}</span>
<span class='details'>{details}</span>
<Percent {percentCompleted} {relativePath} />