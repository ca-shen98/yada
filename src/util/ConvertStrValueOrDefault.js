export default (valueStr, defaultValue, failureMessage, convertFromString = valueStr => JSON.parse(valueStr)) => {
  let value = defaultValue;
  if (valueStr) {
    try { value = convertFromString(valueStr); }
    catch (e) {
      if (failureMessage) { console.log(failureMessage); }
      console.log(e);
    }
  }
  return value;
};
