import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Share2, Copy, Check } from 'lucide-react';

export const QRCodeInvite: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Only access window.location on the client side
    setUrl(window.location.href);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Join my Hangguy game!',
          text: 'Scan the QR code or open the link to play Hangguy with me.',
          url: url,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] px-3.5 py-2.5 bg-accent text-accent-ink transition-[filter] hover:brightness-95"
        aria-label="Invite friends"
      >
        <QrCode size={16} />
        <span className="hidden sm:inline">Invite</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-toast"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm flex flex-col items-center p-8 relative panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-2 text-muted transition-colors hover:text-ink"
              aria-label="Close"
            >
              <X size={22} />
            </button>

            <div className="text-center mb-6 mt-1">
              <h2 className="font-mono text-xl font-extrabold text-ink">
                Invite friends
              </h2>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted mt-2">
                Scan to join instantly
              </p>
            </div>

            <div className="bg-white p-4 border-[1.5px] border-line mb-6">
              <QRCodeSVG
                value={url}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="L"
                marginSize={0}
              />
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleCopy}
                className="flex-1 flex justify-center items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] py-3 border-[1.5px] border-line text-ink transition-colors hover:bg-accent/15"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>

              {typeof navigator.share === 'function' && (
                <button
                  onClick={handleShare}
                  className="flex-1 flex justify-center items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] py-3 bg-accent text-accent-ink transition-[filter] hover:brightness-95"
                >
                  <Share2 size={16} />
                  Share
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
