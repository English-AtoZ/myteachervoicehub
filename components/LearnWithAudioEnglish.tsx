
import React, { useState, useEffect, useRef } from 'react';
import './../types';
import BackButton from './BackButton';

interface Props {
  onBack: () => void;
}

const LearnWithAudioEnglish: React.FC<Props> = ({ onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [englishText, setEnglishText] = useState('');
  const [hindiTranslation, setHindiTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = false;

      recognitionRef.current.onresult = async (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript;
        setEnglishText(text);
        await translateToHindi(text);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const translateToHindi = async (text: string) => {
    if (!text) return;
    setIsLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      const translated = data[0][0][0];
      setHindiTranslation(translated);
      speakHindi(translated);
    } catch (error) {
      setHindiTranslation("Translation failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const speakHindi = (text: string) => {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'hi-IN';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  };

  const startListening = () => {
    if(recognitionRef.current) {
      setEnglishText('');
      setHindiTranslation('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-gray-50 font-sans flex justify-center items-center overflow-hidden">
      <BackButton onClick={onBack} />
      <div className="w-full  p-5 box-border flex flex-col justify-between">
        <div className="flex mb-5 flex-col gap-5 overflow-y-auto pt-16">
          <div className="p-4 rounded-lg bg-gray-200 text-left border-l-4 border-rose-500">
            <small className="text-gray-600">English Sentence (What you said):</small>
            <p className="text-2xl md:text-3xl font-bold my-1 text-blue-700 min-h-[40px]">{englishText || "..."}</p>
          </div>

          <div className="p-4 rounded-lg bg-green-100 text-left border-l-4 border-green-600">
            <small className="text-gray-600">Hindi Translation:</small>
            <p className="text-2xl md:text-3xl font-bold my-1 text-red-600 min-h-[40px]">
              {isLoading ? "Translating..." : hindiTranslation || "..."}
            </p>
          </div>
        </div>

        <div className="text-center mb-10">
          <button
            onClick={startListening}
            disabled={isListening || isLoading}
            className="border-none font-bold text-green-600 hover:text-green-700 text-lg cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isListening ? 'Listening...' : 'Tap to Speak English'}
          </button>
          <p className="mt-2.5 text-red-500 font-bold text-sm">
            {isListening ? "Listening... Speak in English" : "English to Hindi Practice"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LearnWithAudioEnglish;
