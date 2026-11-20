import { useEffect, useRef, useState } from "react";
import { resolveVideo } from "../../components/video/VideoProviderResolver";
import UniversalVideoViewport from "../../components/video/UniversalVideoViewport";
import { viewportRecord } from "../../components/video/videoUtils";

const RECORDS = [
  {
    title: "Big Buck Bunny",
    hostedUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    source: "YouTube watch URL given for this test",
  },
  {
    title: "Tears of Steel",
    hostedUrl: "https://www.youtube.com/watch?v=OHOpb2fS-cM",
    source: "YouTube id already used on the Tears of Steel sample",
  },
  {
    title: "Update to how Shorts views are counted",
    hostedUrl: "https://www.youtube.com/shorts/oobWTqKFLy0",
    source: "YouTube Creators Short, confirmed by oEmbed (author YouTube Creators, frame 113×200)",
  },
  {
    title: "MDN flower MP4",
    hostedUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    source: "Direct MP4 given for this test",
  },
  {
    title: "MDN flower WebM",
    hostedUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    source: "Direct WebM given for this test",
  },
  {
    title: "Google sample Big Buck Bunny MP4",
    hostedUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    source: "Direct MP4 given for this test",
  },
  {
    title: "Big Buck Bunny on Vimeo",
    hostedUrl: "https://vimeo.com/1084537",
    source: "Vimeo oEmbed: title Big Buck Bunny, author Blender, author_url vimeo.com/yourown3dsoftware, video_id 1084537",
  },
  {
    title: "Missing file",
    hostedUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/missing-flower.mp4",
    source: "A file that is not on the MDN host, used as the bad-link case",
  },
  {
    title: "Ordinary webpage",
    hostedUrl: "https://example.com",
    source: "Reserved webpage, not a video file",
  },
];

function statusOf(node) {
  if (!node) return "loading";
  if (node.dataset.error) return "error";
  if (node.dataset.playing === "true") return "playing";
  if (node.dataset.ready === "true") return "paused";
  if (node.dataset.provider === "unknown") return "open original";
  return "loading";
}

function LabItem({ item, index }) {
  const box = useRef(null);
  const record = viewportRecord(item, index);
  const resolved = resolveVideo(record);
  const [status, setStatus] = useState("loading");
  const [frame, setFrame] = useState("");
  const [orientation, setOrientation] = useState(
    resolved.ratio ? (resolved.ratio[0] < resolved.ratio[1] ? "portrait" : "landscape") : "unspecified",
  );

  useEffect(() => {
    const root = box.current?.querySelector(".vv");
    if (!root) return undefined;
    const read = () => {
      const rect = root.getBoundingClientRect();
      setStatus(statusOf(root));
      setFrame(`${Math.round(rect.width)}×${Math.round(rect.height)}`);
      if (root.dataset.orientation) setOrientation(root.dataset.orientation);
    };
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true });
    read();
    return () => observer.disconnect();
  }, []);

  return (
    <article className="labItem" ref={box}>
      <h2>{item.title}</h2>
      <p className="labMeta">
        {resolved.provider} · {orientation} · {frame || "measuring"} · {status}
      </p>
      <p className="labMeta">{item.source}</p>
      <UniversalVideoViewport video={record} />
    </article>
  );
}

export default function VideoLab() {
  return (
    <main className="bnd">
      <div className="pageFrame pageStack">
        <header className="pageIntro">
          <h1>Video lab</h1>
          <p>Dev only. These players are not part of the published work.</p>
        </header>
        <div className="labList">
          {RECORDS.map((item, index) => (
            <LabItem key={item.hostedUrl} item={item} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
