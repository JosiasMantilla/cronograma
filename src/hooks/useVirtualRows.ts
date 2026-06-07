import { useRef } from 'react';
import type { FixedSizeList } from 'react-window';

export function useVirtualRows() {
  const leftListRef = useRef<FixedSizeList>(null);
  const rightListRef = useRef<FixedSizeList>(null);
  const syncing = useRef(false);

  const onLeftScroll = ({ scrollOffset }: { scrollOffset: number }) => {
    if (syncing.current) return;
    syncing.current = true;
    rightListRef.current?.scrollTo(scrollOffset);
    syncing.current = false;
  };

  const onRightScroll = ({ scrollOffset }: { scrollOffset: number }) => {
    if (syncing.current) return;
    syncing.current = true;
    leftListRef.current?.scrollTo(scrollOffset);
    syncing.current = false;
  };

  return { leftListRef, rightListRef, onLeftScroll, onRightScroll };
}
