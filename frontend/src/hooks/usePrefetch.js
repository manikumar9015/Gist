import { useEffect } from 'react';
import { prefetchChunk } from '../api/books';

/**
 * Custom hook to prefetch the next two chunks in the background.
 * Evicts older chunks from cache by letting the browser manage memory,
 * and calling the prefetch endpoint silently.
 */
export function usePrefetch(bookId, currentChunk, totalChunks, easyRead) {
  useEffect(() => {
    if (!bookId) return;

    // Prefetch chunk N + 1
    const nextChunk1 = currentChunk + 1;
    if (nextChunk1 < totalChunks) {
      prefetchChunk(bookId, nextChunk1, easyRead);
    }

    // Prefetch chunk N + 2
    const nextChunk2 = currentChunk + 2;
    if (nextChunk2 < totalChunks) {
      prefetchChunk(bookId, nextChunk2, easyRead);
    }
  }, [bookId, currentChunk, totalChunks, easyRead]);
}
