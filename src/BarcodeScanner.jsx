import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const [scanned, setScanned] = useState(false);
  const controlsRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    codeReader
      .decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result && !scanned) {
          const text = result.getText().trim();

          console.log("ZXING RAW:", text);

          if (text && /^\d{8,14}$/.test(text)) {
            setScanned(true);

            // ✅ poprawne zatrzymanie kamery
            if (controlsRef.current) {
              controlsRef.current.stop();
            }

            onDetected(text);
          }
        }
      })
      .then((controls) => {
        controlsRef.current = controls;
      });

    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [onDetected, scanned]);

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%" }} />
      <button
        onClick={() => {
          if (controlsRef.current) {
            controlsRef.current.stop();
          }
          onClose();
        }}
      >
        Zamknij
      </button>
    </div>
  );
}
