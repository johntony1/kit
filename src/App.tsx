import { QrCodeModal } from "../QrCodeModal";

export default function App() {
  return (
    /* padding-top instead of flex justify-center — keeps the button's
     * top-left anchor fixed as the modal grows taller, preventing the
     * "button jumps" effect caused by flex re-centering on height change. */
    <div
      className="min-h-screen flex flex-col items-center bg-white"
      style={{ paddingTop: "calc(50vh - 22px)" }}
    >
      <QrCodeModal url="https://example.com/shared" />
    </div>
  );
}
