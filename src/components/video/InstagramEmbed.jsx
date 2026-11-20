import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useLatest } from './videoUtils';

/*
  Official Instagram embed iframe. The oEmbed endpoint
  (https://developers.facebook.com/docs/instagram/oembed) returns this player.
  It does not document programmatic mute, so the frame keeps Instagram's controls.
*/
const InstagramEmbed = forwardRef(function InstagramEmbed(props, ref) {
  const { id, reel } = props;
  const cb = useLatest(props);
  const src = useMemo(
    () => `https://www.instagram.com/${reel ? 'reel' : 'p'}/${id}/embed`,
    [id, reel]
  );

  useImperativeHandle(ref, () => ({
    play: () => Promise.resolve(),
    pause: () => {},
    setMuted: () => {},
  }), []);

  return (
    <iframe
      src={src}
      title="Instagram video"
      allow="autoplay; encrypted-media; picture-in-picture"
      onLoad={() => cb.current.onReady?.({ audioControl: false, events: false })}
    />
  );
});

export default InstagramEmbed;
