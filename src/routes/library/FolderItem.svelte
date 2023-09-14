<script>
  import { page } from '$app/stores';
  /** @type {string} */
  export let title
  /** @type {string} */
  export let details

  const { token } = $page.data


</script>

<div class='title'>{title}</div>
<div class='details'>{details}</div>

<style>
</style>