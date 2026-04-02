import { QrCodeModal } from "../QrCodeModal";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed center — removed from flow so button and modal are always
          centered regardless of the component's own height. */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <QrCodeModal url="https://example.com/shared" />
      </div>
    </div>
  );
}
