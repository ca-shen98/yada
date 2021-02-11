export const fetchWithTimeout = async (uri, options, time = 7500) => {
  const controller = new AbortController();
  setTimeout(() => {
    controller.abort();
  }, time);
  return await fetch(uri, { ...options, signal: controller.signal }).then(
    (response) => {
      if (!response.ok) {
        console.log(response);
      }
      return response;
    }
  );
};
