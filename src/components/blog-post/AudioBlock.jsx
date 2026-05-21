import { MusicNote01Icon } from "@hugeicons/core-free-icons";
import HugeIcon from "../shared/HugeIcon";
import { sanitizeBlogHtml } from "./utils";

function AudioIcon() {
  return (
    <HugeIcon
      icon={MusicNote01Icon}
      className="blogPostAudioIcon"
      size={24}
      strokeWidth={1.75}
    />
  );
}

export default function AudioBlock({ block }) {
  if (!block?.url) return null;

  const captionHtml = sanitizeBlogHtml(block.captionHtml || block.caption);

  return (
    <div className="blogPostAudioBlock">
      <AudioIcon />
      <div className="blogPostAudioContent">
        <audio controls>
          <source src={block.url} type="audio/mpeg" />
        </audio>
        {captionHtml ? (
          <div
            className="blogPostAudioCaption"
            dangerouslySetInnerHTML={{ __html: captionHtml }}
          />
        ) : null}
      </div>
    </div>
  );
}
