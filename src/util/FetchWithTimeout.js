export const fetchWithTimeout = async (uri, options, time = 30000) => {
  const controller = new AbortController();
  setTimeout(() => {
    controller.abort();
  }, time);
  return await fetch(uri, { ...options, signal: controller.signal }).then(
    (response) => {
      if (!response.ok) {
        console.error(response);
      }
      return response;
    }
  );
};
