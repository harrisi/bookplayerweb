<script lang='ts'>
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  export let data

  const { nonce, token } = data

  onMount(() => {
    if (token) goto('/library')
    const scriptEl = document.createElement('script')
    scriptEl.type = 'text/javascript'
    scriptEl.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    document.body.append(scriptEl)

    document.addEventListener('AppleIDSignInOnSuccess', async event => {
      console.dir(event)
      await fetch('/auth', {
        // @ts-ignore
        body: `${encodeURIComponent('id_token')}=${encodeURIComponent(event.detail.authorization.id_token)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(resp => {
        goto('/library')
      })
      .catch(async resp => {
        console.log(await resp.text())
      })
    })

    // Listen for authorization failures.
    document.addEventListener('AppleIDSignInOnFailure', (event) => {
      console.dir(event)
      // Handle error.
      console.log('failure')
    })

    // so the script isn't added repeatedly on hmr
    return () => scriptEl.remove()
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

<style>
</style>