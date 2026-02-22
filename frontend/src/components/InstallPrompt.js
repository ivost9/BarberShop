import React, { useState, useEffect } from "react";

const InstallPrompt = () => {
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Проверка дали е iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Проверка дали вече е инсталирано (standalone режим)
    const isInStandaloneMode =
      "standalone" in window.navigator && window.navigator.standalone;
    setIsStandalone(isInStandaloneMode);

    // Показваме съобщението, ако е iOS и не е инсталирано
    if (isIosDevice && !isInStandaloneMode) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] bg-zinc-900 border border-amber-500/50 p-4 rounded-2xl shadow-2xl animate-bounce-subtle">
      <div className="flex items-start gap-4">
        <div className="text-3xl">📲</div>
        <div>
          <h4 className="text-white font-bold text-sm uppercase">
            Инсталирай на iPhone
          </h4>
          <p className="text-zinc-400 text-xs mt-1">
            За да получаваш известия: натисни бутона{" "}
            <span className="text-blue-400">
              "Сподели" (квадратчето със стрелка)
            </span>{" "}
            и избери{" "}
            <span className="text-white font-bold">
              "Добави към начален екран"
            </span>
            .
          </p>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-zinc-500 text-xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
