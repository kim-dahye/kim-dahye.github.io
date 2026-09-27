(() => {
  const button = document.querySelector("[data-pronunciation]");
  const status = document.getElementById("pronunciation-status");
  if (!button || !status) return;

  const unavailable = () => {
    status.textContent = "Korean pronunciation is unavailable in this browser.";
  };

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    button.addEventListener("click", unavailable);
    return;
  }

  const synthesis = window.speechSynthesis;
  let koreanVoice = null;
  let activeUtterance = null;
  let startTimeout;

  const updateVoice = () => {
    try {
      const voices = synthesis.getVoices();
      const language = (voice) => voice.lang.toLowerCase().replaceAll("_", "-");
      koreanVoice = voices.find((voice) => language(voice) === "ko-kr") || voices.find((voice) => /^ko(?:-|$)/.test(language(voice))) || null;
    } catch {
      koreanVoice = null;
    }
  };

  // Some browsers populate their voice list after the page has loaded.
  // Refresh the selection without starting audio outside a button click.
  synthesis.addEventListener("voiceschanged", updateVoice);
  updateVoice();

  const stopPlayback = () => {
    // Invalidate old callbacks before cancel() emits an interrupted error.
    activeUtterance = null;
    window.clearTimeout(startTimeout);
    synthesis.cancel();
  };

  button.addEventListener("click", () => {
    status.textContent = "";
    stopPlayback();
    updateVoice();

    // Never leave voice unset: the browser could fall back to English.
    if (!koreanVoice) {
      unavailable();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance("다혜");
      utterance.lang = "ko-KR";
      utterance.voice = koreanVoice;
      activeUtterance = utterance;

      utterance.onstart = () => {
        if (activeUtterance === utterance) window.clearTimeout(startTimeout);
      };
      utterance.onend = () => {
        if (activeUtterance !== utterance) return;
        window.clearTimeout(startTimeout);
        activeUtterance = null;
      };
      utterance.onerror = () => {
        if (activeUtterance !== utterance) return;
        stopPlayback();
        unavailable();
      };

      // Surface silent start failures as well as the API's explicit errors.
      startTimeout = window.setTimeout(() => {
        if (activeUtterance !== utterance) return;
        stopPlayback();
        unavailable();
      }, 8000);
      synthesis.speak(utterance);
    } catch {
      stopPlayback();
      unavailable();
    }
  });

  window.addEventListener("pagehide", () => {
    if (activeUtterance) stopPlayback();
  });
})();
