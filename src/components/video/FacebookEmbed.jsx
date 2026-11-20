import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useLatest } from './videoUtils';

/*
  Official Facebook video plugin.
  https://developers.facebook.com/docs/plugins/embedded-video-player/
  The plugin does not document a mute method that works without the visitor
  granting the Facebook SDK extra permissions, so this frame keeps Facebook's
  own controls and does not draw a mute button.
*/
const FacebookEmbed = forwardRef(function FacebookEmbed(props, ref) {
  const { id, reel } = props;
  const cb = useLatest(props);
  const src = useMemo(() => {
    const page = reel
      ? `https://www.facebook.com/reel/${id}`
      : `https://www.facebook.com/watch/?v=${id}`;
    const params = new URLSearchParams({
      href: page,
      show_text: 'false',
      allowfullscreen: 'true',
    });
    return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
  }, [id, reel]);

  useImperativeHandle(ref, () => ({
    play: () => Promise.resolve(),
    pause: () => {},
    setMuted: () => {},
  }), []);

  return (
    <iframe
      src={src}
      title="Facebook video"
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      onLoad={() => cb.current.onReady?.({ audioControl: false, events: false })}
    />
  );
});

export default FacebookEmbed;
