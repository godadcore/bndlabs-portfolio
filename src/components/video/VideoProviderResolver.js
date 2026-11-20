import { LANDSCAPE, PORTRAIT } from './videoUtils';

/*
  What each provider lets a third-party page do.
    audio     - we can mute/unmute programmatically (custom "Click to unmute")
    autoplay  - we can start it muted when it scrolls into view
    play      - our own Play button works (it can start playback)
    transport - we draw play/pause/fullscreen controls ourselves
    progress  - we can draw the segmented progress bar
    events    - the player tells us when it is playing
*/
const NATIVE = { audio: false, autoplay: false, play: false, transport: false, progress: false, events: false };

const CAPS = {
  youtube: { audio: true, autoplay: true, play: true, transport: true, progress: true, events: true },
  vimeo: { audio: true, autoplay: true, play: true, transport: true, progress: true, events: true },
  tiktok: NATIVE,
  x: NATIVE,
  facebook: NATIVE,
  instagram: NATIVE,
  twitch: NATIVE,
  streamable: NATIVE,
  direct: { audio: true, autoplay: true, play: true, transport: true, progress: true, events: true },
  unknown: NATIVE,
  none: NATIVE,
};

const DIRECT_RE = /\.(mp4|webm|m4v|ogv)$/i;
const YT_ID = /^[\w-]{6,}$/;
const FB_ID = /^\d{6,}$/;
const IG_CODE = /^[A-Za-z0-9_-]{5,30}$/;
const TWITCH_CLIP = /^[A-Za-z0-9][\w-]{4,}$/;
const STREAMABLE_ID = /^[a-z0-9]{4,12}$/i;

function toUrl(value) {
  try {
    const u = new URL(value);
    return /^https?:$/.test(u.protocol) ? u : null;
  } catch {
    return null;
  }
}

function make(provider, extra = {}) {
  return { provider, caps: CAPS[provider], id: null, hash: null, src: null, ratio: null, openUrl: null, ...extra };
}

/*
  Turns the project's video record into { provider, id, ... }.
  Only IDs that pass a strict pattern are ever put into an embed URL,
  so a pasted link can never inject its own embed address.
*/
export function resolveVideo(video = {}) {
  const hint = String(video.videoProvider || '').toLowerCase();
  const candidate = video.directSrc || video.videoUrl || video.originalUrl || '';
  const url = candidate ? toUrl(candidate) : null;
  const openUrl = toUrl(video.originalUrl || '')?.href || toUrl(video.videoUrl || '')?.href || null;

  if (!candidate && !video.embedId) return make('none');

  // Explicit direct file
  if (video.directSrc) {
    const u = toUrl(video.directSrc);
    if (u && DIRECT_RE.test(u.pathname)) return make('direct', { src: u.href, openUrl });
  }

  // Bare embed id with a provider hint (no URL stored)
  if (!url && video.embedId && ['youtube', 'vimeo', 'tiktok', 'x', 'facebook', 'instagram', 'twitch', 'streamable'].includes(hint)) {
    return make(hint, { id: String(video.embedId), ratio: hint === 'tiktok' || hint === 'instagram' ? PORTRAIT : null, openUrl });
  }
  if (!url) return make('unknown', { openUrl });

  const host = url.hostname.replace(/^(www|m)\./, '');

  // YouTube, YouTube Shorts
  if (['youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'youtu.be'].includes(host)) {
    let id = null;
    let short = false;
    if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
    else if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const m = url.pathname.match(/^\/(shorts|embed|live|v)\/([\w-]+)/);
      if (m) {
        id = m[2];
        short = m[1] === 'shorts';
      }
    }
    if (id && YT_ID.test(id)) {
      return make('youtube', {
        id,
        ratio: short ? PORTRAIT : null,
        openUrl: `https://www.youtube.com/watch?v=${id}`,
      });
    }
    return make('unknown', { openUrl: openUrl || url.href });
  }

  // Vimeo
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = url.pathname.match(/(\d{6,})(?:\/([a-f0-9]+))?/i);
    if (m) return make('vimeo', { id: m[1], hash: m[2] || url.searchParams.get('h') || null, openUrl: openUrl || url.href });
    return make('unknown', { openUrl: openUrl || url.href });
  }

  // TikTok (full links only; short vm.tiktok.com links can't be resolved without a network call)
  if (host === 'tiktok.com') {
    const m = url.pathname.match(/\/video\/(\d+)/);
    if (m) return make('tiktok', { id: m[1], ratio: PORTRAIT, openUrl: openUrl || url.href });
    return make('unknown', { openUrl: openUrl || url.href });
  }

  // X / Twitter
  if (host === 'x.com' || host === 'twitter.com') {
    const m = url.pathname.match(/\/status(?:es)?\/(\d+)/);
    if (m) return make('x', { id: m[1], openUrl: openUrl || url.href });
    return make('unknown', { openUrl: openUrl || url.href });
  }

  // Facebook videos and Reels. The plugin is built from the numeric id, not the pasted address.
  if (host === 'facebook.com' || host === 'fb.watch') {
    const fromQuery = url.searchParams.get('v');
    const fromPath = url.pathname.match(/\/(?:videos|reel|reels)\/(\d+)/);
    const id = FB_ID.test(fromQuery || '') ? fromQuery : fromPath?.[1];
    if (id && FB_ID.test(id)) {
      const reel = /\/reels?\//.test(url.pathname);
      return make('facebook', { id, reel, ratio: reel ? PORTRAIT : null, openUrl: openUrl || url.href });
    }
    return make('unknown', { openUrl: openUrl || url.href });
  }

  // Instagram posts and Reels
  if (host === 'instagram.com') {
    const m = url.pathname.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    if (m && IG_CODE.test(m[1])) {
      const reel = /\/reels?\//.test(url.pathname);
      return make('instagram', { id: m[1], reel, ratio: reel ? PORTRAIT : null, openUrl: openUrl || url.href });
    }
    return make('unknown', { openUrl: openUrl || url.href });
  }

  // Twitch clips only
  if (host === 'twitch.tv' || host === 'clips.twitch.tv') {
    const fromQuery = url.searchParams.get('clip');
    const fromPath = url.pathname.match(/\/clip\/([^/]+)/) || (host === 'clips.twitch.tv' ? url.pathname.match(/^\/([^/]+)/) : null);
    const id = fromQuery || fromPath?.[1] || '';
    if (TWITCH_CLIP.test(id) && id !== 'embed') {
      return make('twitch', { id, ratio: LANDSCAPE, openUrl: openUrl || url.href });
    }
    return make('unknown', { openUrl: openUrl || url.href });
  }

  // Streamable
  if (host === 'streamable.com') {
    const m = url.pathname.match(/^(?:\/[eo])?\/([A-Za-z0-9]+)$/);
    if (m && STREAMABLE_ID.test(m[1])) {
      return make('streamable', { id: m[1], openUrl: openUrl || url.href });
    }
    return make('unknown', { openUrl: openUrl || url.href });
  }

  // Any other link that is a real video file
  if (DIRECT_RE.test(url.pathname)) return make('direct', { src: url.href, openUrl: openUrl || url.href });

  // Ordinary web pages are never treated as video files
  return make('unknown', { openUrl: openUrl || url.href });
}
