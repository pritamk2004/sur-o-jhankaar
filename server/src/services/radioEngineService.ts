import { SongModel } from '../models/Song';
import { Song, RadioFilterScope, RadioSessionConfig } from '@sur-o-jhankaar/shared-types';
import { RadioEngine, DEFAULT_RADIO_CONFIG } from '@sur-o-jhankaar/player-core';

export class RadioEngineService {
  public static async getNextRadioTrack(
    scope: RadioFilterScope,
    history: string[] = [],
    lastArtist?: string,
    config: RadioSessionConfig = DEFAULT_RADIO_CONFIG
  ): Promise<{ song: Song | null; remainingCandidates: number }> {
    // 1. Build database filter from scope
    const query: any = { isActive: true };

    if (scope.language && scope.language !== 'All') {
      query.languages = scope.language;
    }

    if (scope.excludedPlaylists && scope.excludedPlaylists.length > 0) {
      query.playlists = { $nin: scope.excludedPlaylists };
    }

    if (scope.includedPlaylists && scope.includedPlaylists.length > 0) {
      query.playlists = { $in: scope.includedPlaylists };
    }

    const docs = await SongModel.find(query).limit(500).lean();
    const candidateSongs = docs.map((d: any) => ({
      ...d,
      id: d._id?.toString()
    })) as unknown as Song[];

    // 2. Refine candidates with in-memory inclusion/exclusion filters
    const validCandidates = RadioEngine.filterCandidates(candidateSongs, scope);

    // 3. Score and select next song
    const selectedSong = RadioEngine.selectNextSong(validCandidates, history, lastArtist, config);

    return {
      song: selectedSong,
      remainingCandidates: validCandidates.length
    };
  }
}
