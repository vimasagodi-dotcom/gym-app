import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('gymapp_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    if (dismissed) return;

    // 1. Deteta se a app já está a correr como PWA Standalone (instalada)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true);

    if (isStandalone) return;

    // 2. Detetação para iOS (Safari móvel)
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream: unknown }).MSStream;
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    // 3. Detetação para Android / Chrome (beforeinstallprompt)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [dismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowAndroidBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowAndroidBanner(false);
    setShowIosGuide(false);
    setDismissed(true);
    localStorage.setItem('gymapp_pwa_dismissed', 'true');
  };

  if (dismissed || (!showAndroidBanner && !showIosGuide)) {
    return null;
  }

  return (
    <div className="fixed top-3 left-3 right-3 max-w-md mx-auto z-50 animate-slide-down">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl shadow-amber-500/10 text-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            {showIosGuide ? <Share size={20} /> : <Download size={20} />}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black tracking-tight text-slate-100">
              Instala no teu Telemóvel
            </h4>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
              {showIosGuide
                ? "Toca em Partilhar e depois 'Ecrã Principal'"
                : 'Usa offline e com ecrã completo no ginásio'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {showAndroidBanner && deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm"
            >
              Instalar
            </button>
          )}

          {showIosGuide && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-1 rounded-xl">
              <PlusSquare size={13} />
              <span>Adicionar</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
            title="Fechar aviso"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
