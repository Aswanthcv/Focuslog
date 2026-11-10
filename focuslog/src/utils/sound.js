let audioContext;

const SOUND_MUTED_KEY = "focuslog-sound-muted";

// Create the audio context from the Start click so browsers allow sound later.
export function prepareAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return Promise.reject(new Error("Web Audio is not supported in this browser."));
  }

  audioContext ??= new AudioContextClass();
  return audioContext.resume();
}

// Play three soft sine-wave notes with quick fades to make a short chime.
export function playEndSound() {
  if (!audioContext || audioContext.state !== "running" || getSoundMuted()) {
    return;
  }

  const notes = [523.25, 659.25, 783.99];
  const startTime = audioContext.currentTime;

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const noteStart = startTime + index * 0.16;
    const noteEnd = noteStart + 0.42;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteEnd);
  });
}

export function getSoundMuted() {
  return localStorage.getItem(SOUND_MUTED_KEY) === "true";
}

export function saveSoundMuted(muted) {
  localStorage.setItem(SOUND_MUTED_KEY, String(muted));
}
