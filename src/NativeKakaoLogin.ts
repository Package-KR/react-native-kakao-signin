import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  login(): Promise<{ [key: string]: string }>;
  loginWithKakaoAccount(): Promise<{ [key: string]: string }>;
  logout(): Promise<string>;
  unlink(): Promise<string>;
  getProfile(): Promise<{ [key: string]: Object }>;
  getAccessToken(): Promise<{ [key: string]: Object }>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNKakaoLogin');
