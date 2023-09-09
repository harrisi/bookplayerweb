<script>
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  export let data
  import { dev } from '$app/environment'

  const { nonce } = data
  onMount(() => {
    if (dev) {
      const signin = /** @type {HTMLDivElement} */ (document.querySelector('#appleid-signin'))
      signin.style.backgroundColor = 'red'
      signin.style.width = '100px'
      signin.style.height = '100px'
      signin.addEventListener('click', () => {
        const event = new CustomEvent('AppleIDSignInOnSuccess', {
          detail: {
            authorization: {
              id_token: 'some_jwt',
              code: 'some.other.code',
            },
          },
        })
        document.dispatchEvent(event)
      })
    } else {
      const scriptEl = document.createElement('script')
      scriptEl.type = 'text/javascript'
      scriptEl.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
      document.body.append(scriptEl)
    }

    document.addEventListener('AppleIDSignInOnSuccess', async event => {
      fetch('/auth', {
        body: `${encodeURIComponent('id_token')}=${encodeURIComponent(event.detail.authorization.id_token)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(resp => {
        goto('/player')
      })
      .catch(async resp => {
        console.log(await resp.text())
      })
    })

    // Listen for authorization failures.
    document.addEventListener('AppleIDSignInOnFailure', (event) => {
      // Handle error.
      console.log('failure')
    })
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