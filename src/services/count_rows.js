import axios from './axios';

export default async function count ({ keyword }) {
  const resp = await axios.get('/api/data/count', {
    params: {
      keyword
    }
  });
  return resp.data;
}