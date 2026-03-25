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
          title: 'Join my Hang Guy game!',
          text: 'Scan the QR code or click the link to play Hang Guy with me.',
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
        className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2"
        style={{ background: 'var(--accent)', boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}
        aria-label="Invite Friends"
      >
        <QrCode size={18} />
        <span className="hidden sm:inline">Invite Friends</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm flex flex-col items-center p-8 rounded-3xl animate-bounce-in relative"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6 mt-2">
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--accent)' }}>
                Invite Friends
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Scan to join the game instantly
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 mb-6">
              <QRCodeSVG
                value={url}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
              />
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleCopy}
                className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold transition-colors hover:bg-zinc-100 border-2"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              
              {typeof navigator.share === 'function' && (
                <button
                  onClick={handleShare}
                  className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-white transition-transform hover:scale-105 active:scale-95"
                  style={{ background: 'var(--accent)' }}
                >
                  <Share2 size={18} />
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
