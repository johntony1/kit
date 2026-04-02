import { QrCodeModal } from "../QrCodeModal";

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <QrCodeModal url="https://example.com/shared" />
    </div>
  );
}
