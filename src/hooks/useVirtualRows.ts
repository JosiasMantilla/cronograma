import { useRef } from 'react';
import type { VariableSizeList } from 'react-window';

export function useVirtualRows() {
  const leftListRef = useRef<VariableSizeList>(null);
  const rightListRef = useRef<VariableSizeList>(null);
  const syncing = useRef(false);

  const onLeftScroll = ({ scrollOffset }: { scrollOffset: number }) => {
    if (syncing.current) return;
    syncing.current = true;
    rightListRef.current?.scrollTo(scrollOffset);
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  };

  const onRightScroll = ({ scrollOffset }: { scrollOffset: number }) => {
    if (syncing.current) return;
    syncing.current = true;
    leftListRef.current?.scrollTo(scrollOffset);
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  };

  return { leftListRef, rightListRef, onLeftScroll, onRightScroll };
}
