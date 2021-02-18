export const convertStrValueOrDefault = (
  valueStr,
  defaultValue,
  failureMessage,
  convertFromString = (valueStr) => JSON.parse(valueStr)
) => {
  let value = defaultValue;
  if (valueStr) {
    try {
      value = convertFromString(valueStr);
    } catch (e) {
      if (failureMessage) {
        console.error(failureMessage);
      }
      console.error(e);
    }
  }
  return value;
};

export const convertStrValueOrDefaultIfFalsy = (
  valueStr,
  defaultValue,
  failureMessage,
  convertFromString = (valueStr) => JSON.parse(valueStr)
) => {
  if (!valueStr) {
    return defaultValue;
  }
  let value = null;
  try {
    value = convertFromString(valueStr);
  } catch (e) {
    if (failureMessage) {
      console.error(failureMessage);
    }
    console.error(e);
  }
  return value;
};
