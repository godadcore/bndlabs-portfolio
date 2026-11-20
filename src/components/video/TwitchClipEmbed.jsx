import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useLatest } from './videoUtils';

/*
  Official Twitch clip embed.
  https://dev.twitch.tv/docs/embed/video-and-clips/
  `parent` must be the hostname of the page. Twitch does not give this embed
  a mute method we can call, so the clip keeps Twitch's own controls.
*/
const TwitchClipEmbed = forwardRef(function TwitchClipEmbed(props, ref) {
  const { id } = props;
  const cb = useLatest(props);
  const src = useMemo(() => {
    const params = new URLSearchParams({
      clip: id,
      parent: window.location.hostname,
      autoplay: 'true',
      muted: 'true',
    });
    return `https://clips.twitch.tv/embed?${params.toString()}`;
  }, [id]);

  useImperativeHandle(ref, () => ({
    play: () => Promise.resolve(),
    pause: () => {},
    setMuted: () => {},
  }), []);

  return (
    <iframe
      src={src}
      title="Twitch clip"
      allow="autoplay; fullscreen"
      allowFullScreen
      onLoad={() => cb.current.onReady?.({ audioControl: false, events: false })}
    />
  );
});

export default TwitchClipEmbed;
