import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useLatest } from './videoUtils';

/*
  Official Streamable embed: https://streamable.com/e/{id}
  Streamable does not document a mute API for this iframe, so it keeps its own controls.
*/
const StreamableEmbed = forwardRef(function StreamableEmbed(props, ref) {
  const { id } = props;
  const cb = useLatest(props);
  const src = useMemo(() => `https://streamable.com/e/${id}`, [id]);

  useImperativeHandle(ref, () => ({
    play: () => Promise.resolve(),
    pause: () => {},
    setMuted: () => {},
  }), []);

  return (
    <iframe
      src={src}
      title="Streamable video"
      allow="autoplay; fullscreen"
      allowFullScreen
      onLoad={() => cb.current.onReady?.({ audioControl: false, events: false })}
    />
  );
});

export default StreamableEmbed;
