declare module '*.css' {
  const styles: any;
  export = styles;
}

declare module 'freeice' {
  const getAdr: () => RTCIceServer[];
  export = getAdr;
}