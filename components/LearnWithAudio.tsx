
import React, { useState, useEffect, useRef } from 'react';
import './../types';
import BackButton from './BackButton';

interface Props {
  onBack: () => void;
}

const LearnWithAudio: React.FC<Props> = ({ onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [hindiText, setHindiText] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
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
        await translateToEnglish(text);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const translateToEnglish = async (text: string) => {
    if (!text) return;
    setIsLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      const translated = data[0][0][0];
      setEnglishTranslation(translated);
      speakEnglish(translated);
    } catch (error) {
      setEnglishTranslation("Translation failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const speakEnglish = (text: string) => {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setHindiText('');
      setEnglishTranslation('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-gray-50 font-sans flex justify-center items-center overflow-hidden">
      <BackButton onClick={onBack} />
      <div className="w-full p-5 box-border flex flex-col justify-between">
        <div className="flex mb-5 flex-col gap-5 overflow-y-auto pt-16">
          <div className="p-4 rounded-lg bg-gray-200 text-left border-l-4 border-sky-500">
            <small className="text-gray-600">Hindi Sentence:</small>
            <p className="text-2xl md:text-3xl font-bold my-1 text-blue-700 min-h-[40px]">{hindiText || "..."}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-100 text-left border-l-4 border-green-600">
            <small className="text-gray-600">English Translation:</small>
            <p className="text-2xl md:text-3xl font-bold my-1 text-red-600 min-h-[40px]">
              {isLoading ? "Translating..." : englishTranslation || "..."}
            </p>
          </div>
        </div>

        <div className="text-center mb-4">
          <button
            onClick={startListening}
            disabled={isListening || isLoading}
            className="border-none font-bold text-green-600 hover:text-green-700 text-lg transition-colors bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Every Day English Practice
          </button>
          <p className="mt-2.5 text-red-500 font-bold text-sm">
            {isListening ? "English Speaking Practice..." : "Tap above to start"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LearnWithAudio;
