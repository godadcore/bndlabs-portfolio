import { useId } from "react";

export default function BrandMark({ className = "", title }) {
  const uid = useId().replace(/:/g, "");
  const mainGradientId = `brand-mark-main-${uid}`;
  const accentGradientId = `brand-mark-accent-${uid}`;
  const tealGradientId = `brand-mark-teal-${uid}`;
  const goldGradientId = `brand-mark-gold-${uid}`;

  return (
    <svg
      className={className}
      viewBox="172 240 118 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M198.697 260.669V245.545C198.697 243.983 199.969 242.719 201.531 242.728L257.852 243.064C288.838 242.711 290.07 289.366 257.852 286.197C289.718 292.887 285.317 324.93 254.331 328.275H201.514C199.958 328.275 198.697 327.014 198.697 325.458V320.704C198.697 319.149 199.958 317.888 201.514 317.888H223.603C224.013 317.888 224.42 317.798 224.79 317.621C227.291 316.428 228.789 315.474 229.597 314.373C230.517 313.12 229.128 311.726 227.573 311.726H201.514C199.958 311.726 198.697 310.464 198.697 308.909V293.592C198.697 292.036 199.958 290.775 201.514 290.775H222.329C222.618 290.775 222.907 290.707 223.195 290.684C225.14 290.53 223.153 295.106 220.574 301.159C219.788 303.003 221.143 305.035 223.148 305.035H249.543C249.799 305.035 250.057 305.004 250.299 304.919C254.078 303.597 254.203 299.19 250.675 295.823C250.211 295.382 249.581 295.173 248.941 295.173H232.5C231.256 295.346 231.276 294.155 233.341 289.336C234.15 287.446 232.794 285.317 230.739 285.317H201.514C199.958 285.317 198.697 284.056 198.697 282.5V272.289C198.697 270.733 199.958 269.472 201.514 269.472H220.838C222.171 269.472 223.142 270.737 222.797 272.025C222.452 273.313 223.422 274.578 224.756 274.578H247.661C248.11 274.578 248.559 274.476 248.943 274.242C253.562 271.428 253.132 266.138 248.9 263.769C248.542 263.569 248.133 263.486 247.723 263.486H201.514C199.958 263.486 198.697 262.225 198.697 260.669Z"
        fill={`url(#${mainGradientId})`}
      />
      <path
        d="M273.697 248.169L248.169 263.486C252.218 266.303 254.331 270.352 248.521 274.578L258.204 286.197C286.725 288.486 285.493 256.444 273.697 248.169Z"
        fill={`url(#${accentGradientId})`}
      />
      <rect x="173.521" y="242.711" width="22.5352" height="7.39437" rx="3.16901" fill="#1FAAEB" />
      <rect x="178.803" y="290.951" width="17.2535" height="6.69014" rx="3.16901" fill="#C74AAD" />
      <rect x="185.141" y="262.782" width="10.9155" height="5.98592" rx="2.99296" fill="#5389E0" />
      <rect x="185.141" y="322.289" width="10.9155" height="5.98592" rx="2.99296" fill="#FB9D3B" />
      <path
        d="M220.721 242.711H199.577C198.994 242.711 198.521 243.184 198.521 243.768V262.43C198.521 263.013 198.994 263.486 199.577 263.486H229.596C230.372 263.486 230.883 262.677 230.55 261.976L221.675 243.314C221.5 242.946 221.129 242.711 220.721 242.711Z"
        fill={`url(#${tealGradientId})`}
      />
      <path
        d="M229.284 263.486L220.88 242.711C261.549 241.831 271.937 242.359 275.106 250.634L248.389 263.486H229.284Z"
        fill={`url(#${goldGradientId})`}
      />
      <defs>
        <linearGradient id={mainGradientId} x1="240.127" y1="242.711" x2="240.127" y2="328.275" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E33E4B" />
          <stop offset="0.4375" stopColor="#F9A833" />
          <stop offset="1" stopColor="#54288A" />
        </linearGradient>
        <linearGradient id={accentGradientId} x1="264.863" y1="248.169" x2="264.863" y2="286.314" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDB72B" />
          <stop offset="1" stopColor="#F67927" />
        </linearGradient>
        <linearGradient id={tealGradientId} x1="224.754" y1="250.81" x2="200.106" y2="250.81" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9ECAB3" />
          <stop offset="1" stopColor="#2998E8" />
        </linearGradient>
        <linearGradient id={goldGradientId} x1="265.423" y1="250.106" x2="223.697" y2="250.106" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBB3B" />
          <stop offset="0.813604" stopColor="#CFCB8C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
