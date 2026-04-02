import { QrCodeModal } from "../QrCodeModal";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Full-screen fixed container — size NEVER changes, so Framer Motion's
          FLIP bounding-box measurements stay stable throughout the morph.
          (translate(-50%,-50%) shifts when the wrapper resizes, causing a jump;
          inset:0 + flex centering avoids that entirely.) */}
      <div
        style={{
          position:       "fixed",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          pointerEvents:  "none",
          zIndex:         50,
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <QrCodeModal url="https://example.com/shared" />
        </div>
      </div>
    </div>
  );
}
