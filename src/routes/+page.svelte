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
    document.addEventListener('AppleIDSignInOnSuccess', async event => {
      // Handle successful response.
      console.log('success')
      console.dir(event);
      const f = await fetch('https://api.tortugapower.com/v1/user/login',
        {
          body: JSON.stringify({
            token_id: event.detail.authorization.id_token,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      ).then(resp => resp.text())
      .catch(error => error)
      console.log(f)
    });

    // Listen for authorization failures.
    document.addEventListener('AppleIDSignInOnFailure', (event) => {
      // Handle error.
      console.log('failure')
      console.dir(event);
    });
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