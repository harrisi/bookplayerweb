<script lang='ts'>
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { user } from '$lib/api.js';
  import { browser, dev } from '$app/environment'

  onMount(() => {
    const token = localStorage.getItem('token')
    if (token) goto('/library')

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
  })

  const books = [
    [
      {src: 'books/prideandprejudice.png', alt: 'Pride and Prejudice',},
      {src: 'books/greengables.png', alt: 'Anne of Green Gables',},
      {src: 'books/sherlock.png', alt: 'The Return of Sherlock Holmes',},
      {src: 'books/littlewomen.png', alt: 'Little Women',},
    ],
    [
      {src: 'books/warpeace.png', alt: 'War and Peace',},
      {src: 'books/twelveyears.png', alt: 'Twelve Years a Slave',},
      {src: 'books/lighthouse.png', alt: 'To the Lighthouse',},
      {src: 'books/frankenstein.png', alt: 'Frankenstein',},
      {src: 'books/secretgarden.png', alt: 'The Secret Garden',},
    ],
    [
      {src: 'books/jekyllhyde.png', alt: 'The Strange Case of Dr. Jekyll and Mr. Hyde',},
      {src: 'books/alice.png', alt: "Alice's Adventures in Wonderland",},
      {src: 'books/bigfour.png', alt: 'The Big Four',},
      {src: 'books/dracula.png', alt: 'Dracula',},
    ],
    [
      {src: 'books/americantragedy.png', alt: 'An American Tragedy',},
      {src: 'books/artofwar.png', alt: 'The Art of War',},
      {src: 'books/gatsby.png', alt: 'The Great Gatsby',},
      {src: 'books/wizard.png', alt: 'The Wonderful Wizard of Oz',},
      {src: 'books/wutheringheights.png', alt: 'Wuthering Heights',},
    ],
  ]

</script>

<svelte:head>
  <meta name="appleid-signin-client-id" content="com.tortugapower.audiobookplayer.loginservice">
  <meta name="appleid-signin-scope" content="email">
  <meta name="appleid-signin-redirect-uri" content={dev ? 'https://bp.fofgof.xyz' : (browser ? window.location.origin : '')}>
  <meta name="appleid-signin-state" content="BookPlayerWeb login">
  <meta name="appleid-signin-use-popup" content="true">
  <script type='text/javascript' src='https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js' defer></script>
</svelte:head>

<div class='container'>

  <div class='left'>

    <div class='content'>
      <div class='logo'>
        <svg class='svgBack' xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M39.9908 0.855957L99.7023 0.855957C113.513 0.855957 118.52 2.29389 123.569 4.99402C128.618 7.69414 132.58 11.6565 135.281 16.7053C137.981 21.7541 139.419 26.762 139.419 40.5722V100.284C139.419 114.094 137.981 119.102 135.281 124.151C132.58 129.199 128.618 133.162 123.569 135.862C118.52 138.562 113.513 140 99.7023 140H39.9908C26.1806 140 21.1727 138.562 16.1239 135.862C11.0751 133.162 7.11272 129.199 4.41259 124.151C1.71246 119.102 0.274536 114.094 0.274536 100.284L0.274536 40.5722C0.274536 26.762 1.71246 21.7541 4.41259 16.7053C7.11272 11.6565 11.0751 7.69414 16.1239 4.99402C21.1727 2.29389 26.1806 0.855957 39.9908 0.855957Z" fill="white"/>
        </svg>
        <svg class='svgTop' width="139" height="139" viewBox="0 0 139 139" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.53" fill-rule="evenodd" clip-rule="evenodd" d="M69.3397 41.1304C69.3534 41.0985 69.3675 41.0668 69.3822 41.0349C69.5883 40.5874 69.8958 40.2214 70.301 39.9411C70.7062 39.6607 71.1136 39.4829 72.2841 39.2777L116.56 31.5173C116.618 31.5071 116.677 31.4987 116.735 31.492C118.356 31.3067 119.82 32.4706 120.006 34.0917C120.784 40.902 121.173 52.8302 121.173 69.8761C121.173 86.8032 120.79 98.5559 120.022 105.134C120.015 105.19 120.007 105.246 119.997 105.302C119.716 106.909 118.185 107.983 116.578 107.702L72.2841 99.9381C71.1136 99.733 70.7062 99.5551 70.301 99.2748C69.8958 98.9945 69.5883 98.6284 69.3822 98.1809C69.3675 98.1491 69.3534 98.1173 69.3397 98.0854C69.3261 98.1173 69.3119 98.1491 69.2973 98.1809C69.0911 98.6284 68.7837 98.9945 68.3785 99.2748C67.9732 99.5551 67.5658 99.733 66.3953 99.9381L22.1019 107.702C20.4949 107.983 18.9637 106.909 18.682 105.302C18.6723 105.246 18.6641 105.19 18.6576 105.134C17.8899 98.5559 17.506 86.8032 17.506 69.8761C17.506 52.8302 17.8953 40.902 18.6738 34.0917C18.8591 32.4706 20.3234 31.3067 21.9445 31.492C22.0029 31.4987 22.0611 31.5071 22.119 31.5173L66.3953 39.2777C67.5658 39.4829 67.9732 39.6607 68.3785 39.9411C68.7837 40.2214 69.0911 40.5874 69.2973 41.0349C69.3119 41.0668 69.3261 41.0985 69.3397 41.1304Z" fill="#3488D1"/>
          <path opacity="0.56" fill-rule="evenodd" clip-rule="evenodd" d="M69.3397 40.2579C69.4936 39.8968 69.7155 39.5867 70.0099 39.3211C70.3308 39.0316 70.6579 38.8257 71.6361 38.448L104.489 25.7628C104.731 25.6694 104.984 25.6082 105.242 25.5809C106.864 25.409 108.319 26.5849 108.491 28.2074C109.426 37.0333 109.894 50.8013 109.894 69.5116C109.894 88.215 109.426 102.047 108.492 111.006C108.463 111.283 108.395 111.555 108.29 111.813C107.675 113.324 105.952 114.051 104.44 113.436L71.5775 100.067C70.6179 99.677 70.298 99.4694 69.9848 99.1799C69.7024 98.9191 69.489 98.6175 69.3397 98.2682C69.1905 98.6175 68.9771 98.9191 68.6947 99.1799C68.3814 99.4694 68.0616 99.677 67.1019 100.067L34.2392 113.436C32.7279 114.051 31.0043 113.324 30.3895 111.813C30.2845 111.555 30.2166 111.283 30.1877 111.006C29.2531 102.047 28.7859 88.215 28.7859 69.5116C28.7859 50.8013 29.2535 37.0333 30.1887 28.2074C30.3606 26.5849 31.8153 25.409 33.4378 25.5809C33.6956 25.6082 33.9488 25.6694 34.1906 25.7628L67.0433 38.448C68.0215 38.8257 68.3487 39.0316 68.6695 39.3211C68.9639 39.5867 69.1858 39.8968 69.3397 40.2579Z" fill="#293694"/>
          <path opacity="0.51" fill-rule="evenodd" clip-rule="evenodd" d="M69.3397 39.7081C69.4111 39.5504 69.4983 39.4007 69.6033 39.2548C69.7968 38.986 69.9984 38.7732 70.6379 38.2471L91.1187 21.4008C91.5451 21.0501 92.0612 20.8259 92.6085 20.7536C94.226 20.5399 95.7105 21.6779 95.9242 23.2954C97.3591 34.1553 98.0766 49.5686 98.0766 69.5353C98.0766 89.4706 97.3614 104.932 95.931 115.918C95.8571 116.486 95.6201 117.02 95.2487 117.455C94.1895 118.696 92.3248 118.843 91.0837 117.784L70.5857 100.292C69.9651 99.7619 69.7701 99.55 69.5833 99.2837C69.487 99.1465 69.4064 99.0064 69.3397 98.8597C69.2731 99.0064 69.1924 99.1465 69.0962 99.2837C68.9094 99.55 68.7143 99.7619 68.0938 100.292L47.5957 117.784C46.3546 118.843 44.4899 118.696 43.4308 117.455C43.0594 117.02 42.8223 116.486 42.7485 115.918C41.3181 104.932 40.6029 89.4706 40.6029 69.5353C40.6029 49.5686 41.3203 34.1553 42.7552 23.2954C42.969 21.6779 44.4535 20.5399 46.071 20.7536C46.6183 20.8259 47.1344 21.0501 47.5607 21.4008L68.0416 38.2471C68.6811 38.7732 68.8827 38.986 69.0761 39.2548C69.1812 39.4007 69.2684 39.5504 69.3397 39.7081Z" fill="#3A258F"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M58.2042 62.3582L69.4018 51.9367C70.1618 51.2293 71.3514 51.272 72.0588 52.032C72.3826 52.38 72.5626 52.8376 72.5626 53.3128V85.9035C72.5626 86.9418 71.7209 87.7835 70.6826 87.7835C70.2073 87.7835 69.7497 87.6035 69.4018 87.2797L58.2071 76.8609H51.07C50.232 76.8609 49.9281 76.7737 49.6217 76.6098C49.3154 76.446 49.0749 76.2055 48.9111 75.8992C48.7472 75.5928 48.66 75.2889 48.66 74.4509V64.7682C48.66 63.9302 48.7472 63.6263 48.9111 63.32C49.0749 63.0136 49.3154 62.7732 49.6217 62.6093C49.9281 62.4455 50.232 62.3582 51.07 62.3582H58.2042ZM77.5987 62.0525C77.0349 61.5707 76.9685 60.7231 77.4503 60.1593C77.9321 59.5955 78.7797 59.529 79.3435 60.0108C82.0084 62.2882 83.5739 65.6115 83.5739 69.1863C83.5739 72.7446 82.0228 76.0542 79.379 78.3313C78.8171 78.8153 77.9692 78.7521 77.4852 78.1902C77.0012 77.6282 77.0644 76.7803 77.6263 76.2963C79.6839 74.5242 80.8882 71.9545 80.8882 69.1863C80.8882 66.4053 79.6727 63.8249 77.5987 62.0525ZM80.7582 55.7226C80.1932 55.2422 80.1246 54.3948 80.6049 53.8298C81.0853 53.2647 81.9328 53.1961 82.4978 53.6765C87.0404 57.5387 89.7102 63.1872 89.7102 69.2671C89.7102 75.3274 87.0576 80.9596 82.5401 84.8215C81.9764 85.3035 81.1287 85.2371 80.6468 84.6734C80.1649 84.1097 80.2312 83.262 80.795 82.7801C84.7217 79.4232 87.0246 74.5337 87.0246 69.2671C87.0246 63.9834 84.7068 59.0798 80.7582 55.7226Z" fill="white"/>
        </svg>
      </div>

      <h1>Welcome to BookPlayer!</h1>

      <h2>A wonderful player for your audiobooks</h2>

      <div id="appleid-signin" class='signin-button' data-color="black" data-border="true" data-type="sign in"></div>
    </div>

    <div class='footer'>
      <p>
        BookPlayer is an open source project.
        <a href='https://discord.gg/MjCUXgU'>Join us on our Discord server</a>
        or
        <a href='https://github.com/tortugapower/bookplayerweb'>view the project on GitHub</a>.
      </p>
    </div>
  </div>

  <div class='right'>
      {#each [0, 1, 2, 3] as column}
      <div class='column'>
        <div class='booksContainer {'abcd'[column]}'>
        {#each books[column] as book}
          <div class='book-item'>
            <img src={book.src} alt={book.alt} />
          </div>
        {/each}
        {#each books[column] as book}
          <div class='book-item'>
            <img src={book.src} alt={book.alt} />
          </div>
        {/each}
        </div>
      </div>
      {/each}
  </div>

</div>

<style>
  h1 {
    font-family: Inter;
    font-size: 33px;
    font-weight: 600;
    line-height: 40px;
    letter-spacing: -0.02em;
    margin-bottom: 10px;
  }

  h2 {
    font-family: Inter;
    font-size: 20px;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: 0em;
    margin-bottom: 50px;
  }

  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-height: 98vh;
    overflow: hidden;
  }

  .container .left {
    display: grid;
    grid-template-rows: 1fr auto;
    /* background-color: green; */
    justify-content: center;
    align-items: center;
    text-align: center;
    max-height: 98vh;
  }

  .logo {
    background-color: #fff;
    border-radius: 35px;
    justify-self: center;
    box-shadow: 0px 20px 46px 0px #87A0BA4A;
    position: relative;
    width: 140px;
    height: 140px;
    margin-bottom: 3.5rem;
  }

  .svgBack {
    position: absolute;
    top: 0;
    left: 0;
  }

  .svgTop {
    position: absolute;
    top: 0;
    left: 0;
  }

  .content {
    /* background-color: purple; */
    display: grid;
    justify-content: center;
    align-items: center;
  }

  .footer {
    margin: 1.5em;
  }

  .right::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0.58;
    background: linear-gradient(45deg, #3E8ACD 3.63%, #494AA3 92.51%);
    pointer-events: none; /* Allows clicking through the overlay */
  }

  .right {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    position: relative;
    gap: 0;
    max-height: 98vh;
  }

  .column {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-height: 100%;
    position: relative;
  }

  .book-item {
    width: auto;
    margin-bottom: -5px;
    padding-bottom: -5px;
  }

  .book-item img {
    width: 100%;
  }

  .booksContainer.a .book-item:first-child {
    margin-top: -100px;
  }

  .booksContainer.b .book-item:first-child {
    margin-top: -150px;
  }

  .booksContainer.c .book-item:first-child {
    margin-top: -100px;
  }

  .booksContainer.d .book-item:first-child {
    margin-top: -50px;
  }

  .book-item:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
  }

  /* Duplicate the book items within each column */
  .booksContainer::after {
    content: "";
    display: block;
    height: 100%; /* Same height as the column to push the duplicate set into view */
  }

  @keyframes scrollBooks {
    0% { transform: translateY(0%); }
    100% { transform: translateY(-50%); } /* Scrolls the content up */
  }

  @keyframes scrollBooksUp {
    0% { transform: translateY(-50%); }
    100% { transform: translateY(0%); } /* Scrolls the content up */
  }

  .booksContainer.a {
    animation: scrollBooks 1100s infinite linear;
  }
  .booksContainer.b {
    animation: scrollBooksUp 900s infinite linear;
  }
  .booksContainer.c {
    animation: scrollBooks 990s infinite linear;
  }
  .booksContainer.d {
    animation: scrollBooksUp 1050s infinite linear;
  }

  @media (prefers-reduced-motion) {
    .booksContainer.a,
    .booksContainer.b,
    .booksContainer.c,
    .booksContainer.d {
      animation: none;
    }

    .book-item:hover {
      transform: none;
    }
  }

  .signin-button {
    width: 345px;
    height: 54px;
    justify-self: center;
  }
</style>