import { useEffect } from "react";

const PULL_THRESHOLD = 72;
const MAX_PULL = 108;
const RELOAD_DELAY_MS = 140;
const SETTLE_DELAY_MS = 180;

function dampPullDistance(deltaY) {
  const positiveDelta = Math.max(0, deltaY);
  return Math.min(MAX_PULL, MAX_PULL * (1 - Math.exp((-positiveDelta * 0.68) / MAX_PULL)));
}

export default function usePullToRefresh(scrollRef, enabled = true) {
  useEffect(() => {
    const root = scrollRef?.current;
    if (!enabled || !root || typeof window === "undefined") return undefined;

    let startY = 0;
    let pullDistance = 0;
    let active = false;
    let refreshing = false;
    let settleTimer = 0;

    const setOffset = (value) => {
      root.style.setProperty("--pull-refresh-offset", `${value}px`);
    };

    const setState = (value) => {
      root.setAttribute("data-pull-refresh", value);
    };

    const clearTimers = () => {
      if (settleTimer) {
        window.clearTimeout(settleTimer);
        settleTimer = 0;
      }
    };

    const reset = () => {
      active = false;
      pullDistance = 0;
      setState("settling");
      setOffset(0);
      clearTimers();
      settleTimer = window.setTimeout(() => {
        if (!refreshing) {
          setState("idle");
        }
      }, SETTLE_DELAY_MS);
    };

    const triggerRefresh = () => {
      refreshing = true;
      setState("refreshing");
      setOffset(56);
      clearTimers();
      settleTimer = window.setTimeout(() => {
        window.location.reload();
      }, RELOAD_DELAY_MS);
    };

    const onTouchStart = (event) => {
      if (refreshing || root.scrollTop > 0 || event.touches.length !== 1) return;

      active = true;
      pullDistance = 0;
      startY = event.touches[0].clientY;
      setState("pulling");
      setOffset(0);
    };

    const onTouchMove = (event) => {
      if (!active || refreshing) return;

      const touch = event.touches[0];
      if (!touch) return;

      const deltaY = touch.clientY - startY;
      if (deltaY <= 0) {
        if (pullDistance <= 0) {
          active = false;
          setState("idle");
          setOffset(0);
        }
        return;
      }

      if (root.scrollTop > 0) {
        reset();
        return;
      }

      event.preventDefault();
      pullDistance = dampPullDistance(deltaY);
      setOffset(pullDistance);
      setState(pullDistance >= PULL_THRESHOLD ? "ready" : "pulling");
    };

    const onTouchEnd = () => {
      if (!active || refreshing) return;

      active = false;
      if (pullDistance >= PULL_THRESHOLD) {
        triggerRefresh();
        return;
      }

      reset();
    };

    setState("idle");
    setOffset(0);

    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd);
    root.addEventListener("touchcancel", onTouchEnd);

    return () => {
      clearTimers();
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("touchcancel", onTouchEnd);
      root.removeAttribute("data-pull-refresh");
      root.style.removeProperty("--pull-refresh-offset");
    };
  }, [enabled, scrollRef]);
}
