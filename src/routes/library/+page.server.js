/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
  const { token } = await parent()
  return {
    token
  }
}