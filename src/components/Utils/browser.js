export const isInAppBrowser = () =>
  /FBAN|FBAV|Instagram/i.test(navigator.userAgent);