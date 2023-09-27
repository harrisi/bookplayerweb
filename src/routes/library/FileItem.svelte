<script lang='ts'>
  export let relativePath: string
  export let title: string
  export let details: string
  export let currentTime: number
  export let duration: number
  export let percentCompleted: number
  import Percent from "./Percent.svelte";
  // import { setContext } from 'svelte'
  import { createWritable } from '$lib/store'
  // setContext(title, createWritable(percentCompleted))
  createWritable(relativePath, percentCompleted)
</script>

<span class='title'>{title}</span>
<span class='details'>{details}</span>
<Percent {relativePath} />