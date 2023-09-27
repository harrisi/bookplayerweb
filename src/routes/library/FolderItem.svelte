<script lang='ts'>
  export let relativePath: string
  export let title: string
  export let details: string
  export let percentCompleted: number
  import Percent from "./Percent.svelte";
  import { createWritable } from '$lib/store'
  createWritable(relativePath, percentCompleted)
</script>

<div class='title'>{title}</div>
<div class='details'>{details}</div>
<Percent {relativePath} />
