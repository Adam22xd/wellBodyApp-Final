import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");
  const controlsRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isMounted = true;

    async function startScanner() {
      try {
        const controls = await codeReader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
            },
          },
          videoRef.current,
          (result) => {
            if (result && !scanned) {
              const text = result.getText().trim();

              if (text && /^\d{8,14}$/.test(text)) {
                setScanned(true);

                if (controlsRef.current) {
                  controlsRef.current.stop();
                }

                onDetected(text);
              }
            }
          },
        );

        if (!isMounted) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setError("");
      } catch (scanError) {
        console.error("Scanner start failed:", scanError);
        if (isMounted) {
          setError(
            "Nie udało się uruchomić kamery. Sprawdź uprawnienia aparatu i spróbuj ponownie.",
          );
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [onDetected, scanned]);

  const handleClose = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
    }

    onClose();
  };

  return (
    <div className="scanner-modal">
      <div className="scanner-shell">
        <button
          type="button"
          className="scanner-close"
          onClick={handleClose}
        >
          Zamknij
        </button>

        <div className="scanner-copy">
          <p className="scanner-kicker">Skaner kodu</p>
          <h2>Zeskanuj produkt</h2>
          <span>Ustaw kod kreskowy w ramce i przytrzymaj telefon stabilnie.</span>
        </div>

        <div className="scanner-stage">
          <video
            ref={videoRef}
            className="scanner-video"
            muted
            autoPlay
            playsInline
          />
          <div className="scanner-frame">
            <div className="scanner-frame-box" />
          </div>
        </div>

        {error ? <p className="scanner-error">{error}</p> : null}
      </div>
    </div>
  );
}
