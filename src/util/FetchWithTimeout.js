
export const SERVER_BASE_URL = "https://yaas.azurewebsites.net/";

export const fetchWithTimeout = (uri, time = 5000) => {
  const controller = new AbortController();
  setTimeout(() => { controller.abort(); }, time);
  return Promise.resolve(fetch(uri, { signal: controller.signal }).then((response) => {
    if (!response.ok) { console.log(response); }
    return response
  }));
};
