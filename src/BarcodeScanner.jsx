import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");
  const [scanHint, setScanHint] = useState(
    "Ustaw kod w ramce i trzymaj stabilnie.",
  );
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const controlsRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isMounted = true;
    let hintInterval = null;

    async function startScanner() {
      setScanHint("Ustaw kod w ramce i trzymaj stabilnie.");
      let detectStartTime = Date.now();

      hintInterval = setInterval(() => {
        if (scanned) {
          return;
        }
        const elapsed = (Date.now() - detectStartTime) / 1000;

        if (elapsed < 4) {
          setScanHint("Trzymaj kod w ramce.");
        } else if (elapsed < 8) {
          setScanHint("Przesuń kod trochę bliżej kamery.");
        } else {
          setScanHint("Spróbuj delikatnie oddalić kod i znowu skanuj.");
        }
      }, 1000);

      try {
        const controls = await codeReader.decodeFromConstraints(
          {
            audio: false,
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
              facingMode: { ideal: "environment" },
            },
          },
          videoRef.current,
          (result) => {
            if (result && !scanned) {
              const text = result.getText().trim();

              if (text && /^\d{6,14}$/.test(text)) {
                if (hintInterval) {
                  clearInterval(hintInterval);
                  hintInterval = null;
                }

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
          if (hintInterval) {
            clearInterval(hintInterval);
            hintInterval = null;
          }
          return;
        }

        controlsRef.current = controls;

        const track = videoRef.current?.srcObject?.getVideoTracks?.()[0];
        if (track?.getCapabilities) {
          const capabilities = track.getCapabilities();
          if (capabilities.torch) {
            setTorchSupported(true);
          }
        }

        setError("");
      } catch (scanError) {
        if (hintInterval) {
          clearInterval(hintInterval);
          hintInterval = null;
        }
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
      if (hintInterval) {
        clearInterval(hintInterval);
      }
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [onDetected]);

  const handleClose = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
    }

    onClose();
  };

  const toggleTorch = async () => {
    const track = videoRef.current?.srcObject?.getVideoTracks?.()[0];
    if (!track || !track.applyConstraints) {
      return;
    }

    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((prev) => !prev);
    } catch (err) {
      console.warn("Torch not available", err);
      setError("Latarka niedostępna na tym urządzeniu.");
    }
  };

  return (
    <div className="scanner-modal">
      <div className="scanner-shell">
        <button type="button" className="scanner-close" onClick={handleClose}>
          Zamknij
        </button>

        <div className="scanner-copy">
          <p className="scanner-kicker">Skaner kodu</p>
          <h2>Zeskanuj produkt</h2>
          <span>{scanHint}</span>
          {torchSupported && (
            <button
              type="button"
              className="scanner-torch"
              onClick={toggleTorch}
              style={{ marginTop: "10px" }}
            >
              {torchOn ? "Wyłącz latarkę" : "Włącz latarkę"}
            </button>
          )}
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
