import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { loadScript, useLatest } from './videoUtils';

/*
  Official X embed (platform.twitter.com/widgets.js, loaded lazily).
  X gives a third-party page no control over playback or audio, so this adapter
  reports { audioControl: false, events: false }: the post uses its own controls,
  and no custom mute button is shown. Deleted or protected posts show the error state.
*/
const XVideoEmbed = forwardRef(function XVideoEmbed(props, ref) {
  const { id } = props;
  const cb = useLatest(props);
  const host = useRef(null);

  useImperativeHandle(ref, () => ({
    play: () => Promise.resolve(),
    pause: () => {},
    setMuted: () => {},
  }), []);

  useEffect(() => {
    let cancelled = false;
    const whenReady = () =>
      new Promise((resolve) => (window.twttr?.ready ? window.twttr.ready(resolve) : resolve()));

    loadScript('https://platform.twitter.com/widgets.js')
      .then(whenReady)
      .then(() =>
        window.twttr.widgets.createTweet(id, host.current, {
          dnt: true,
          conversation: 'none',
          align: 'center',
        })
      )
      .then((el) => {
        if (cancelled) return;
        if (el) cb.current.onReady?.({ audioControl: false, events: false });
        else cb.current.onError?.();
      })
      .catch(() => cb.current.onError?.());

    return () => {
      cancelled = true;
      if (host.current) host.current.innerHTML = '';
    };
  }, [id]);

  return <div ref={host} className="vv__host" />;
});

export default XVideoEmbed;
