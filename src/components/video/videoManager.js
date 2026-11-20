/* One video plays at a time. Starting one pauses the previous one. */
const pausers = new Map();
let active = null;

export const videoManager = {
  register(id, pause) {
    pausers.set(id, pause);
    return () => {
      pausers.delete(id);
      if (active === id) active = null;
    };
  },
  claim(id) {
    if (active && active !== id) pausers.get(active)?.();
    active = id;
  },
  release(id) {
    if (active === id) active = null;
  },
};
