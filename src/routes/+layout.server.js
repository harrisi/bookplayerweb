/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
  const id_token = cookies.get('id_token');

  return {
      user: id_token
  };
}