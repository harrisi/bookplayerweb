<script lang='ts'>
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { user } from '$lib/api.js';
  import { browser, dev } from '$app/environment'

  onMount(() => {
    const token = localStorage.getItem('token')
    if (token) goto('/library')

    const scriptEl = document.createElement('script')
    scriptEl.type = 'text/javascript'
    scriptEl.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    document.body.append(scriptEl)

    document.addEventListener('AppleIDSignInOnSuccess', async event => {
      console.dir(event)
      const { id_token } = event.detail.authorization

      await user.login({id_token})
        .then(resp => {
          console.log(resp)
          localStorage.setItem('email', resp.email)
          localStorage.setItem('token', resp.token)
          goto('/library')
        })
        .catch(async resp => {
          console.dir(await resp)
        })
    })

    document.addEventListener('AppleIDSignInOnFailure', (event) => {
      console.dir(event)
      console.log('failure')
    })

    // so the script isn't added repeatedly on hmr
    return () => scriptEl.remove()
  })
</script>

<svelte:head>
  <meta name="appleid-signin-client-id" content="com.tortugapower.audiobookplayer.loginservice">
  <meta name="appleid-signin-scope" content="email">
  <meta name="appleid-signin-redirect-uri" content={dev ? 'https://bp.fofgof.xyz' : (browser ? window.location.origin : '')}>
  <meta name="appleid-signin-state" content="BookPlayerWeb login">
  <meta name="appleid-signin-use-popup" content="true">
</svelte:head>

<h1>Welcome to BookPlayerWeb</h1>

<p>This is a web front end for <a href="https://github.com/tortugapower/bookplayer">BookPlayer</a></p>

<div id="appleid-signin" data-color="black" data-border="true" data-type="sign in"></div>