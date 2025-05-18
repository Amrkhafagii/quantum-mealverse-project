
export interface BiometricPluginInterface {
  isAvailable(): Promise<{ available: boolean, biometryType: string }>;
  authenticate(options: { reason: string, title: string }): Promise<{ authenticated: boolean }>;
  setupBiometricLogin(options: { userId: string, token: string }): Promise<{ success: boolean }>;
}
