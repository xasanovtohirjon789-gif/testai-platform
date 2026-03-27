import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.testai.app',
  appName: 'TestAI',
  webDir: 'out',
  server: {
    // Online ishlashi uchun Netlify URL
    url: 'https://testai-platform.netlify.app',
    cleartext: true
  },
  android: {
    backgroundColor: '#1e1b4b'
  }
};

export default config;
