
import React, { useState, useEffect, useRef } from 'react';
import './../types';
import BackButton from './BackButton';

interface Props {
  onBack: () => void;
}

const HindiToSanskritAudio: React.FC<Props> = ({ onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [hindiText, setHindiText] = useState('');
  const [sanskritTranslation, setSanskritTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'hi-IN';
      recognitionRef.current.continuous = false;

      recognitionRef.current.onresult = async (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript;
        setHindiText(text);
        await translateToSanskrit(text);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const translateToSanskrit = async (text: string) => {
    if (!text) return;
    setIsLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=sa&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      const translated = data[0][0][0];
      setSanskritTranslation(translated);
      speakSanskrit(translated);
    } catch (error) {
      console.error("Translation Error:", error);
      setSanskritTranslation("Anuvada viphala (Translation failed).");
    } finally {
      setIsLoading(false);
    }
  };

  const speakSanskrit = (text: string) => {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'hi-IN';
    msg.rate = 0.8;
    window.speechSynthesis.speak(msg);
  };

  const startListening = () => {
    if (recognitionRef.current) {
        setHindiText('');
        setSanskritTranslation('');
        setIsListening(true);
        recognitionRef.current.start();
    }
  };

  return (
    <div className="relative p-5 font-sans bg-gray-50 min-h-screen">
      <BackButton onClick={onBack} />
      <div className="text-center bg-indigo-800 text-white p-4 rounded-lg mb-5 mt-12">
        <h6 className="text-xl font-bold">🎙️ Hindi to Sanskrit Audio</h6>
        <p className="text-sm opacity-80">Sanskrit Version</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-5 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <button
            onClick={startListening}
            disabled={isListening || isLoading}
            className={`w-20 h-20 rounded-full border-none text-white text-4xl cursor-pointer transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${isListening ? 'bg-red-500' : 'bg-indigo-600'}`}
          >
            {isListening ? '🛑' : '🎤'}
          </button>
          <p className="mt-2.5 text-indigo-700 font-bold text-sm">
            {isListening ? "Shrunvantu... (Listening in Hindi)" : "Tap the mic to speak Hindi"}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="p-4 rounded-lg bg-gray-100 text-left">
            <small className="text-gray-500">You said (Hindi):</small>
            <p className="text-lg my-1 text-gray-800 min-h-[28px]">{hindiText || "..."}</p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 text-left border-l-4 border-purple-500">
            <small className="text-gray-500">Sanskrit Translation (Audio):</small>
            <p className="text-xl font-bold my-1 text-indigo-800 min-h-[32px]">
              {isLoading ? "Anuvadam karoti..." : sanskritTranslation || "..."}
            </p>
            {sanskritTranslation && !isLoading && (
              <button onClick={() => speakSanskrit(sanskritTranslation)} className="bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-100 py-1 px-3 rounded-md cursor-pointer mt-2.5 text-sm transition-colors">
                🔊 Re-play
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HindiToSanskritAudio;
