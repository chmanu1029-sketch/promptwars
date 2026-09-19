// SOLYA Speech Synthesis and Recognition Service

class SolyaSpeech {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isSpeaking = false;
    this.recognition = null;
    this.isListening = false;
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      } catch (e) {
        console.warn("Speech recognition initialization note:", e);
      }
    }
  }

  speak(text, onEnd) {
    if (!this.synth) {
      console.log("TTS not supported in browser, simulated speak:", text);
      if (onEnd) setTimeout(onEnd, 1500);
      return;
    }

    this.synth.cancel(); // cancel previous

    const utterance = new SpeechSynthesisUtterance(text);
    // Select Indian English or Hindi voice if available
    const voices = this.synth.getVoices();
    const langCode = currentLanguage === 'hi' ? 'hi' : 'en';
    const matchVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang.includes("IN"));
    if (matchVoice) {
      utterance.voice = matchVoice;
    }

    utterance.rate = 0.9; // slightly slower, very clear for seniors
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      window.dispatchEvent(new CustomEvent("speechStarted"));
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      window.dispatchEvent(new CustomEvent("speechEnded"));
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn("Speech synthesis notice:", err);
      this.isSpeaking = false;
      window.dispatchEvent(new CustomEvent("speechEnded"));
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      window.dispatchEvent(new CustomEvent("speechEnded"));
    }
  }

  startListening(onResult, onError) {
    if (!this.recognition) {
      // Graceful simulated voice prompt for environments without audio input permissions
      const promptText = prompt("Voice mode (simulate voice query for Solya):", "What medicines do I have today?");
      if (promptText) {
        onResult(promptText);
      } else if (onError) {
        onError("Simulated voice input cancelled");
      }
      return;
    }

    try {
      this.recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      this.recognition.onstart = () => {
        this.isListening = true;
        window.dispatchEvent(new CustomEvent("voiceListeningStarted"));
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        window.dispatchEvent(new CustomEvent("voiceListeningEnded"));
        onResult(transcript);
      };

      this.recognition.onerror = (err) => {
        this.isListening = false;
        window.dispatchEvent(new CustomEvent("voiceListeningEnded"));
        // Fallback to simulated prompt
        const promptText = prompt("Speech recognition had a minor issue. You can type what you said:", "What medicines do I have today?");
        if (promptText) {
          onResult(promptText);
        } else if (onError) {
          onError(err.error);
        }
      };

      this.recognition.start();
    } catch (e) {
      const promptText = prompt("Speak to Solya (type voice input):", "What medicines do I have today?");
      if (promptText) onResult(promptText);
    }
  }
}

const solyaSpeech = new SolyaSpeech();
