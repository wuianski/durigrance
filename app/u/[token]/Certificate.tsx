"use client";

import { useEffect, useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";

const VIMEO_ID = "1231004615";

type CertificateProps = {
  name: string;
  userNumber: string;
  registeredAt: string;
};

function formatActivatedDate(value: string) {
  const datePart = value.split(" ")[0] ?? "";
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${year}.${month}.${day}`;
}

function isAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

async function shareCertificateFile(file: File) {
  if (typeof navigator.share !== "function") return false;
  try {
    const payload = { files: [file], title: "Duri-grance Certificate" };
    if (
      typeof navigator.canShare === "function" &&
      !navigator.canShare(payload)
    ) {
      return false;
    }
    await navigator.share(payload);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return true;
    }
    return false;
  }
}

function triggerFileDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function Chevron() {
  return (
    <svg
      className="certificate-action-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M9 5l8 7-8 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Certificate({
  name,
  userNumber,
  registeredAt,
}: CertificateProps) {
  const captureRef = useRef<HTMLElement>(null);
  const downloadingRef = useRef(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [savePreview, setSavePreview] = useState<{
    url: string;
    file: File;
  } | null>(null);

  const activated = formatActivatedDate(registeredAt);

  useEffect(() => {
    if (!videoOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [videoOpen]);

  async function downloadCertificate() {
    if (!captureRef.current || downloadingRef.current) return;
    downloadingRef.current = true;
    try {
      await document.fonts.ready;
      const images = Array.from(captureRef.current.querySelectorAll("img"));
      await Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }),
        ),
      );
      const captureOptions = {
        pixelRatio: isAppleTouchDevice() ? 1.5 : 2,
        cacheBust: true,
        backgroundColor: "#000000",
      };
      let blob = await toBlob(captureRef.current, captureOptions);
      if (!blob) {
        const dataUrl = await toPng(captureRef.current, captureOptions);
        blob = await fetch(dataUrl).then((response) => response.blob());
      }
      if (!blob) return;
      const filename = `durigrance-certificate-${userNumber}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      const url = URL.createObjectURL(blob);

      triggerFileDownload(url, filename);

      const shared = await shareCertificateFile(file);
      if (shared && !isAppleTouchDevice()) {
        window.setTimeout(() => URL.revokeObjectURL(url), 2000);
        return;
      }

      if (isAppleTouchDevice()) {
        setSavePreview((current) => {
          if (current) URL.revokeObjectURL(current.url);
          return { url, file };
        });
        return;
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } finally {
      downloadingRef.current = false;
    }
  }

  function closeVideo() {
    setVideoOpen(false);
  }

  function closeSavePreview() {
    setSavePreview((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }

  return (
    <>
      <main className="certificate" ref={captureRef}>
        <div className="certificate-inner">
          <img
            className="certificate-mark"
            src="/imgs/logo-fameme.png"
            alt="FAMEME"
          />
          <p className="certificate-kicker">
            DIGITAL CERTIFICATE{" "}
            <span className="certificate-kicker-2">OF AUTHENTICITY</span>
          </p>
        </div>

        <section className="certificate-hero" aria-label="Duri-grance">
          <img
            className="certificate-hero-photo"
            src="/imgs/photo-1.png"
            alt=""
          />
          <div className="certificate-hero-copy">
            <img
              className="certificate-title"
              src="/imgs/logo-durigrance.png"
              alt="Duri-grance"
            />
            <img
              className="certificate-tagline"
              src="/imgs/logo-fame-is-a-scent.png"
              alt="Fame is a Scent"
            />
            <div className="certificate-hero-meta">
              <p className="certificate-label">ARTIST EDITION</p>
              <p className="certificate-number">NO. {userNumber} / 100</p>
              <dl className="certificate-meta">
                <div className="certificate-meta-row">
                  <dt>COLLECTOR</dt>
                  <dd>{name}</dd>
                </div>
                <div className="certificate-meta-row">
                  <dt>ACTIVATED</dt>
                  <dd>{activated}</dd>
                </div>
              </dl>
            </div>
          </div>
          <img
            className="certificate-badge"
            src="/imgs/logo-activated.png"
            alt="Your edition is activated"
          />
        </section>

        <div className="certificate-inner">
          <p className="certificate-includes">THIS EDITION INCLUDES</p>

          <div className="certificate-list">
            <div className="certificate-item">
              <span className="certificate-item-num">01</span>
              <img
                className="certificate-thumb"
                src="/imgs/photo-2.png"
                alt=""
              />
              <div className="certificate-item-copy">
                <p className="certificate-item-title">PHYSICAL ARTWORK</p>
                <p>
                  Duri-grance: Fame is a Scent
                  <br />
                  100ml Eau de Parfum,
                  <br />
                  Original Box &amp; Unique QR Code
                </p>
              </div>
            </div>

            <div className="certificate-item">
              <span className="certificate-item-num">02</span>
              <img
                className="certificate-thumb"
                src="/imgs/photo-3.png"
                alt=""
              />
              <div className="certificate-item-copy">
                <p className="certificate-item-title">VIDEO ARTWORK</p>
                <p>
                  Duri-grance
                  <br />
                  Original Advertising Video
                  <br />
                  Exclusive to Artist Edition
                </p>
              </div>
            </div>

            <div className="certificate-split">
              <div className="certificate-split-copy">
                <span className="certificate-item-num">03</span>
                <div>
                  <p className="certificate-item-title">DIGITAL CERTIFICATE</p>
                  <p>Certificate of Authenticity</p>
                </div>
              </div>
              <button
                type="button"
                className="certificate-action"
                onClick={downloadCertificate}
              >
                <Chevron />
                DOWNLOAD CERTIFICATE
              </button>
            </div>

            <div className="certificate-split">
              <p className="certificate-split-note">
                Exclusive Vision Unlocked
                <br />
                for Edition{" "}
                <span className="certificate-number-s">No. {userNumber}</span>
              </p>
              <button
                type="button"
                className="certificate-action"
                onClick={() => setVideoOpen(true)}
              >
                <Chevron />
                <span className="action-2">WATCH VIDEO</span>
              </button>
            </div>
          </div>

          <footer className="certificate-footer">
            <p>
              ARTIST FAMEME
              <br />
              YEAR 2026
            </p>
            <img
              className="certificate-sign"
              src="/imgs/logo-fameme-sign.png"
              alt="FAMEME signature"
            />
          </footer>
        </div>
      </main>

      {savePreview && (
        <div className="save-preview" role="dialog" aria-modal="true">
          <button
            type="button"
            className="video-close"
            onClick={closeSavePreview}
            aria-label="Close"
          >
            ×
          </button>
          <p className="save-preview-hint">
            Press and hold the image to save to Photos, or tap Save to Files.
          </p>
          <img
            className="save-preview-image"
            src={savePreview.url}
            alt="Duri-grance certificate"
          />
          <button
            type="button"
            className="certificate-action save-preview-share"
            onClick={() => shareCertificateFile(savePreview.file)}
          >
            SAVE TO PHOTOS OR FILES
          </button>
        </div>
      )}
      {videoOpen && (
        <div className="video-overlay" role="dialog" aria-modal="true">
          <button
            type="button"
            className="video-close"
            onClick={closeVideo}
            aria-label="Close video"
          >
            ×
          </button>
          <iframe
            src={`https://player.vimeo.com/video/${VIMEO_ID}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Duri-grance artist edition video"
          />
        </div>
      )}
    </>
  );
}
