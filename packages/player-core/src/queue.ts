import { Song } from '@sur-o-jhankaar/shared-types';

export class QueueManager {
  /**
   * Shuffle an array of songs while keeping the currently playing song in place at index 0
   */
  public static shuffleQueue(queue: Song[], currentSongId?: string): Song[] {
    if (queue.length <= 1) return [...queue];

    const currentSong = currentSongId ? queue.find(s => s.id === currentSongId) : null;
    const others = currentSongId ? queue.filter(s => s.id !== currentSongId) : [...queue];

    // Fisher-Yates shuffle
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }

    return currentSong ? [currentSong, ...others] : others;
  }

  public static shuffleWithCurrentPinned(queue: Song[], currentSong: Song): Song[] {
    return this.shuffleQueue(queue, currentSong.id);
  }

  /**
   * Calculate next index based on repeat and shuffle rules
   */
  public static getNextIndex(currentIndex: number, queueLength: number, repeat: 'off' | 'one' | 'all'): number {
    if (queueLength === 0) return -1;
    if (repeat === 'one') return currentIndex;
    if (currentIndex + 1 < queueLength) return currentIndex + 1;
    if (repeat === 'all') return 0;
    return -1; // End of queue
  }

  /**
   * Calculate previous index
   */
  public static getPrevIndex(currentIndex: number, queueLength: number, repeat: 'off' | 'one' | 'all'): number {
    if (queueLength === 0) return -1;
    if (repeat === 'one') return currentIndex;
    if (currentIndex > 0) return currentIndex - 1;
    if (repeat === 'all') return queueLength - 1;
    return 0;
  }

  public static reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }
}
