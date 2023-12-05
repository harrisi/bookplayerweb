<script lang='ts'>
  import Upload from './upload/+page.svelte'
  import { browser } from '$app/environment'
  import { afterNavigate } from '$app/navigation'
  import Overlay from '$lib/components/Overlay.svelte'
  import ContextMenu from '$lib/components/ContextMenu.svelte'
  import { page } from '$app/stores'
  import Popover from '$lib/components/Popover.svelte'
  import Player from './player/Player.svelte'

  let token = browser && localStorage.getItem('token')
  afterNavigate(() => {
    token = localStorage.getItem('token')
  })

  $: popover = $page.url.search === '?about'

  let dragging: boolean
  let player
</script>

<svelte:head>
  <link rel="manifest" href="manifest.json" />
  <meta name="apple-itunes-app" content="app-id=1138219998">
  <meta name="theme-color" content="#FAFAFA" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#202225" media="(prefers-color-scheme: dark)">
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</svelte:head>

<div class='rootContainer'>

<Overlay --top=0px>
  <header>
    <nav>
      <div class='logoContainer'>
        <div class='logo'>
          <svg class='svgTop' xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path opacity="0.53" fill-rule="evenodd" clip-rule="evenodd" d="M24.0024 14.0588C24.0072 14.0476 24.0121 14.0365 24.0173 14.0254C24.0892 13.8692 24.1965 13.7414 24.338 13.6436C24.4794 13.5457 24.6217 13.4837 25.0303 13.412L40.4859 10.7031C40.5061 10.6995 40.5265 10.6966 40.5468 10.6943C41.1127 10.6296 41.6239 11.0359 41.6885 11.6017C41.9603 13.979 42.0962 18.1428 42.0962 24.0931C42.0962 30.0019 41.9622 34.1044 41.6942 36.4007C41.6919 36.4203 41.6891 36.4398 41.6857 36.4592C41.5873 37.0202 41.0529 37.3953 40.4919 37.2969L25.0303 34.5869C24.6217 34.5153 24.4794 34.4532 24.338 34.3554C24.1965 34.2575 24.0892 34.1298 24.0173 33.9735C24.0121 33.9624 24.0072 33.9514 24.0024 33.9402C23.9977 33.9514 23.9927 33.9624 23.9876 33.9735C23.9157 34.1298 23.8083 34.2575 23.6669 34.3554C23.5254 34.4532 23.3832 34.5153 22.9746 34.5869L7.51301 37.2969C6.95202 37.3953 6.41753 37.0202 6.31921 36.4592C6.3158 36.4398 6.31296 36.4203 6.31067 36.4007C6.04269 34.1044 5.90869 30.0019 5.90869 24.0931C5.90869 18.1428 6.04457 13.979 6.31634 11.6017C6.38102 11.0359 6.89218 10.6296 7.45804 10.6943C7.47843 10.6966 7.49874 10.6995 7.51895 10.7031L22.9746 13.412C23.3832 13.4837 23.5254 13.5457 23.6669 13.6436C23.8083 13.7414 23.9157 13.8692 23.9876 14.0254C23.9927 14.0365 23.9977 14.0476 24.0024 14.0588Z" fill="#3488D1"/>
            <path opacity="0.56" fill-rule="evenodd" clip-rule="evenodd" d="M24.0024 13.7542C24.0562 13.6281 24.1336 13.5199 24.2364 13.4272C24.3484 13.3261 24.4626 13.2542 24.8041 13.1224L36.272 8.69431C36.3565 8.66171 36.4448 8.64036 36.5348 8.63083C37.1012 8.57081 37.609 8.9813 37.669 9.54767C37.9955 12.6285 38.1587 17.4346 38.1587 23.9658C38.1587 30.4947 37.9956 35.3229 37.6694 38.4505C37.6593 38.5472 37.6356 38.642 37.5989 38.7321C37.3843 39.2597 36.7826 39.5134 36.2551 39.2988L24.7836 34.632C24.4486 34.4958 24.337 34.4233 24.2276 34.3223C24.129 34.2312 24.0545 34.1259 24.0024 34.004C23.9503 34.1259 23.8758 34.2312 23.7773 34.3223C23.6679 34.4233 23.5563 34.4958 23.2213 34.632L11.7498 39.2988C11.2222 39.5134 10.6206 39.2597 10.406 38.7321C10.3693 38.642 10.3456 38.5472 10.3355 38.4505C10.0093 35.3229 9.84619 30.4947 9.84619 23.9658C9.84619 17.4346 10.0094 12.6285 10.3359 9.54767C10.3959 8.9813 10.9037 8.57081 11.4701 8.63083C11.5601 8.64036 11.6484 8.66171 11.7328 8.69431L23.2008 13.1224C23.5423 13.2542 23.6565 13.3261 23.7685 13.4272C23.8713 13.5199 23.9487 13.6281 24.0024 13.7542Z" fill="#293694"/>
            <path opacity="0.51" fill-rule="evenodd" clip-rule="evenodd" d="M24.0024 13.5623C24.0273 13.5073 24.0578 13.455 24.0945 13.4041C24.162 13.3102 24.2324 13.2359 24.4556 13.0523L31.6049 7.1717C31.7537 7.04928 31.9339 6.97101 32.1249 6.94577C32.6896 6.87117 33.2078 7.26842 33.2824 7.83305C33.7833 11.624 34.0337 17.0043 34.0337 23.9742C34.0337 30.933 33.784 36.3301 33.2847 40.1653C33.2589 40.3633 33.1762 40.5496 33.0465 40.7016C32.6768 41.1348 32.0259 41.1863 31.5927 40.8166L24.4374 34.7103C24.2207 34.5255 24.1527 34.4515 24.0875 34.3585C24.0539 34.3106 24.0257 34.2617 24.0024 34.2105C23.9792 34.2617 23.951 34.3106 23.9174 34.3585C23.8522 34.4515 23.7841 34.5255 23.5675 34.7103L16.4122 40.8166C15.979 41.1863 15.328 41.1348 14.9583 40.7016C14.8287 40.5496 14.7459 40.3633 14.7202 40.1653C14.2208 36.3301 13.9712 30.933 13.9712 23.9742C13.9712 17.0043 14.2216 11.624 14.7225 7.83305C14.7971 7.26842 15.3153 6.87117 15.88 6.94577C16.071 6.97101 16.2512 7.04928 16.4 7.1717L23.5493 13.0523C23.7725 13.2359 23.8429 13.3102 23.9104 13.4041C23.9471 13.455 23.9775 13.5073 24.0024 13.5623Z" fill="#3A258F"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20.1153 21.4688L24.0241 17.8309C24.2894 17.584 24.7047 17.5989 24.9516 17.8642C25.0646 17.9856 25.1274 18.1454 25.1274 18.3113V29.6878C25.1274 30.0503 24.8336 30.3441 24.4712 30.3441C24.3053 30.3441 24.1455 30.2812 24.0241 30.1682L20.1163 26.5313H17.625C17.3324 26.5313 17.2264 26.5008 17.1194 26.4436C17.0125 26.3864 16.9285 26.3025 16.8713 26.1956C16.8141 26.0886 16.7837 25.9825 16.7837 25.69V22.3101C16.7837 22.0175 16.8141 21.9114 16.8713 21.8045C16.9285 21.6976 17.0125 21.6136 17.1194 21.5564C17.2264 21.4992 17.3324 21.4688 17.625 21.4688H20.1153ZM26.8854 21.3621C26.6886 21.1939 26.6654 20.898 26.8336 20.7012C27.0018 20.5044 27.2977 20.4812 27.4945 20.6494C28.4247 21.4443 28.9712 22.6044 28.9712 23.8523C28.9712 25.0944 28.4297 26.2497 27.5069 27.0445C27.3107 27.2135 27.0147 27.1914 26.8458 26.9953C26.6768 26.7991 26.6989 26.5031 26.895 26.3342C27.6133 25.7156 28.0337 24.8186 28.0337 23.8523C28.0337 22.8815 27.6094 21.9808 26.8854 21.3621ZM27.9883 19.1525C27.7911 18.9848 27.7671 18.689 27.9348 18.4917C28.1025 18.2945 28.3983 18.2705 28.5956 18.4382C30.1812 19.7864 31.1132 21.7582 31.1132 23.8805C31.1132 25.996 30.1872 27.962 28.6103 29.3101C28.4135 29.4783 28.1176 29.4552 27.9494 29.2584C27.7812 29.0616 27.8043 28.7657 28.0011 28.5975C29.3719 27.4257 30.1757 25.7189 30.1757 23.8805C30.1757 22.0361 29.3666 20.3244 27.9883 19.1525Z" fill="white"/>
          </svg>
        </div>
        <span class="logoText">BookPlayer</span>
      </div>
      <div class='headerControls'>
        <div class="about">
          <a class='headerButton' href='?about'>
            <span class="material-symbols-outlined">info</span>
            About
          </a>
        </div>
        <div class='library'>
          <a class='headerButton' href='/library'>
            <span class='material-symbols-outlined'>library_books</span>
            Library
          </a>
        </div>
        <div class='settings'>
          <a class='headerButton' href='/settings'>
            <span class='material-symbols-outlined'>settings</span>
            Settings
          </a>
        </div>
        <div class='loginout'>
          <a class='headerButton logout' href='/' on:click={() => localStorage.removeItem('token')}>
            <span class='material-symbols-outlined'>door_open</span>
            {#if token}
              Logout
            {:else}
              <div class="login">Login</div>
            {/if}
          </a>
        </div>
      </div>
    </nav>
  </header>
</Overlay>

<div class='container'>
  <slot />
</div>

{#if player}
  {#key player.relativePath}
    <Player item={player} />
  {/key}
{/if}

</div>

<!-- {#key dragging}
<Upload bind:dragging />
{/key} -->

<ContextMenu />

{#if popover}
  <Popover />
{/if}

<style>
  .logo {
    justify-self: center;
    position: relative;
    width: 48px;
    height: 48px;
  }

  .svgTop {
    position: absolute;
    top: 0;
    left: 0;
  }

  .logoText {
    font-size: 19px;
  }

  .rootContainer {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    min-height: 100vh;
  }

  a {
    outline: none;
    text-decoration: none;
    border-radius: 3px;
  }

  a:link {
    color: inherit;
  }

  a:visited {
    color: inherit;
  }

  a:focus {
    text-decoration: none;
    background: var(--secondary);
  }

  a:hover {
    text-decoration: none;
    background: var(--secondary);
  }

  a:active {
    background: var(--accent);
    color: var(--primary);
  }

  .material-symbols-outlined {
    font-variation-settings:
    'FILL' var(--fill),
    'wght' 400,
    'GRAD' 0,
    'opsz' 24
  }

  .container {
    display: grid;
  }

  .headerControls {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  a.headerButton {
    display: grid;
    grid-template-rows: 1fr auto;
    padding: 5px;
    margin: 5px;
    justify-content: space-evenly;
  }

  .logoContainer {
    height: inherit;
    justify-self: baseline;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
  }

  header {
    width: 100%;
    display: grid;
    align-items: center;
    box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.10);
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
  }
</style>