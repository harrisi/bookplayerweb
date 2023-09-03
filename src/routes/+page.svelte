<script>
  import { onMount } from 'svelte'
  export let data

  const { nonce } = data
  onMount(() => {
    const scriptEl = document.createElement('script')
    scriptEl.type = 'text/javascript'
    scriptEl.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    // scriptEl.defer = true
    document.body.append(scriptEl)
  })
</script>

<svelte:head>
  <meta name="appleid-signin-client-id" content="com.tortugapower.audiobookplayer.loginservice">
  <meta name="appleid-signin-scope" content="email">
  <meta name="appleid-signin-redirect-uri" content="https://bp.fofgof.xyz/auth">
  <meta name="appleid-signin-state" content="bp.fofgof.xyz login">
  <meta name="appleid-signin-nonce" content="{nonce}">
  <meta name="appleid-signin-use-popup" content="true">
</svelte:head>

<h1>Welcome to BookPlayerWeb</h1>

<p>This is a web front end for <a href="https://github.com/tortugapower/bookplayer">BookPlayer</a></p>

<div id="appleid-signin" data-color="black" data-border="true" data-type="sign in"></div>