import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#00273B",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            color: "#FC6200",
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size }
  );
}
