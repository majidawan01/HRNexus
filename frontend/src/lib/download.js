import API from '../api/axios';
import { blobErrorText } from './errors';

// Authorization header ke saath file mangwa kar blob se download karwata hai
// (window.open header nahi bhej sakta). Fail ho to Error(message) throw hota hai.
export async function downloadFile(url, filename) {
  let res;
  try {
    res = await API.get(url, { responseType: 'blob', timeout: 60000 });
  } catch (err) {
    throw new Error(await blobErrorText(err, 'Download failed.'), { cause: err });
  }
  const objectUrl = window.URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
}
