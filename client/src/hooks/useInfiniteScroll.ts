'use client';

import { useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (
  containerRef: React.RefObject<HTMLElement | null>,
  onLoadMore: () => Promise<void>,
  hasMore: boolean
) => {
  const isLoading = useRef(false);

  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container || isLoading.current || !hasMore) return;

    // Trigger load when scrolled near the top
    if (container.scrollTop < 100) {
      isLoading.current = true;
      const prevScrollHeight = container.scrollHeight;

      await onLoadMore();

      // Maintain scroll position after prepending messages
      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight;
        isLoading.current = false;
      });
    }
  }, [onLoadMore, hasMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
};
