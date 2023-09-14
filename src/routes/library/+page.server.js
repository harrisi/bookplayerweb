// import { api } from '$lib'
// 
// /** @type {import('./$types').LayoutLoad} */
// export async function load({ parent }) {
//   const { token } = await parent()
//   const call = api(token)
//   const a = await call('GET', '/user')
//   .then(res => {
//     console.log('then')
//     console.log(res)
//     return res
//   })
//   .catch(err => {
//     return err
//   })
//   return {
//     a
//   }
// }