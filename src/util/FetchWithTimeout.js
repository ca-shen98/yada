export async function fetchWithTimeout(uri, options, time = 5000) {
  const controller = new AbortController();
  setTimeout(() => { controller.abort(); }, time);
  return await fetch(uri, { ...options, signal: controller.signal }).then((response) => {
    if (!response.ok) { console.log(response); }
    return response
  });
};
