// Axios error ko user ke liye saaf message mein badalta hai
export function errorText(err, fallback = 'Something went wrong.') {
  if (err?.code === 'ECONNABORTED') return 'The server is taking too long to respond.';
  if (!err?.response) return 'Cannot reach the server. Check your connection.';
  return err.response.data?.message || fallback;
}

// responseType: 'blob' par error bhi blob aata hai; usme se message nikalna
export async function blobErrorText(err, fallback) {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.message) return parsed.message;
    } catch {
      /* JSON nahi tha */
    }
    return fallback;
  }
  return errorText(err, fallback);
}
