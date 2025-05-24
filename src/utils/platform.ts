
export const Platform = {
  isNative: () => !!(window as any).Capacitor,
  isMobileDevice: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  
  getOS: (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Mac') !== -1) return 'macOS';
    if (userAgent.indexOf('Win') !== -1) return 'Windows';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    if (userAgent.indexOf('Android') !== -1) return 'Android';
    if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) return 'iOS';
    return 'Unknown';
  }
};
