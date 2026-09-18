import { useState, type DragEvent, type TransitionStartFunction } from "react";

/**
 * Shared drag-and-drop + move-up/move-to-top reordering logic. Keeps a
 * local optimistic order that resyncs whenever the server's set of items
 * changes (add/remove, or a persisted reorder round-tripping), without
 * fighting an in-progress drag — see the render-time state adjustment
 * below (React's recommended alternative to a useEffect for this).
 */
export function useDragReorder<T extends { id: string }>(
  items: T[],
  persist: (orderedIds: string[]) => void | Promise<void>,
  startTransition: TransitionStartFunction
) {
  const [order, setOrder] = useState<T[]>(items);
  const [dragId, setDragId] = useState<string | null>(null);
  const idsKey = items.map((i) => i.id).join(",");

  const [syncedKey, setSyncedKey] = useState(idsKey);
  if (idsKey !== syncedKey) {
    setSyncedKey(idsKey);
    setOrder(items);
  }

  function persistOrder(next: T[]) {
    setOrder(next);
    startTransition(() => persist(next.map((i) => i.id)));
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    setOrder((prev) => {
      const fromIndex = prev.findIndex((i) => i.id === dragId);
      const toIndex = prev.findIndex((i) => i.id === overId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function handleDragEnd() {
    setDragId(null);
    startTransition(() => persist(order.map((i) => i.id)));
  }

  function moveUp(id: string) {
    const index = order.findIndex((i) => i.id === id);
    if (index <= 0) return;
    const next = [...order];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    persistOrder(next);
  }

  function moveToTop(id: string) {
    const index = order.findIndex((i) => i.id === id);
    if (index <= 0) return;
    const next = [...order];
    const [moved] = next.splice(index, 1);
    next.unshift(moved);
    persistOrder(next);
  }

  return {
    order,
    dragId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    moveUp,
    moveToTop,
  };
}
