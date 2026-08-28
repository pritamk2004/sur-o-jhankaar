import { IMusicProvider } from './base';
import { YouTubeProvider } from './youtube';
import { SpotifyProvider } from './spotify';
import { DirectAudioProvider } from './directAudio';
import { ProviderType } from '@sur-o-jhankaar/shared-types';

export * from './base';
export * from './youtube';
export * from './spotify';
export * from './directAudio';

export class ProviderManager {
  private static providers: Map<ProviderType, IMusicProvider> = new Map<ProviderType, IMusicProvider>([
    ['youtube', new YouTubeProvider()],
    ['spotify', new SpotifyProvider()],
    ['direct', new DirectAudioProvider()]
  ]);

  public static getProvider(type: ProviderType): IMusicProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      return this.providers.get('youtube')!;
    }
    return provider;
  }

  public static detectProviderFromUrl(url: string): IMusicProvider {
    for (const provider of this.providers.values()) {
      if (provider.validateUrl(url)) {
        return provider;
      }
    }
    // Default to YouTube provider
    return this.providers.get('youtube')!;
  }
}
