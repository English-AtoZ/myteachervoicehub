
import React, { useState } from 'react';
import './../types';
import BackButton from './BackButton';

interface Props {
    onBack: () => void;
}

const Audios3Bolkar: React.FC<Props> = ({ onBack }) => {
  const [paragraph, setParagraph] = useState('');
  const [clickedWord, setClickedWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const speakHindi = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const speakEnglish = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setParagraph((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const translateWord = async (word: string) => {
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
    if (!cleanWord) return;

    setClickedWord(cleanWord);
    setLoading(true);
    setTranslation('...');

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(cleanWord)}`;
      const response = await fetch(url);
      const data = await response.json();
      const hindiResult = data[0][0][0];
      setTranslation(hindiResult);
      speakHindi(hindiResult); 
    } catch (error) {
      setTranslation("N/A");
    } finally {
      setLoading(false);
    }
  };

  const words = paragraph.split(/\s+/).filter(w => w !== "");

  return (
    <div className="relative p-4 max-w-full min-h-screen mx-auto font-sans bg-gray-50">
        <BackButton onClick={onBack} />
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 rounded-lg p-2 mb-4 mt-12">
            Word Click → Hindi Audio Translator
        </h2>
      
      <div className="relative mb-5">
        <textarea
          rows={5}
          className="w-full p-3 pr-14 rounded-lg border-2 border-gray-300 text-base box-border focus:border-blue-500 focus:ring-blue-500 transition"
          placeholder="Type or click the mic to speak in English..."
          value={paragraph}
          onChange={(e) => setParagraph(e.target.value)}
        />
        <button
          onClick={startListening}
          className={`absolute right-3 top-3 text-white border-none rounded-full w-10 h-10 cursor-pointer text-xl shadow-md flex items-center justify-center transition-colors ${isListening ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'}`}
          title="Speak (English)"
        >
          {isListening ? '🛑' : '🎤'}
        </button>
        {isListening && <p className="text-red-500 text-xs mt-1">Listening... Please speak in English</p>}
      </div>

      <div className="leading-10 text-xl p-6 bg-white rounded-xl border border-gray-200 shadow-sm min-h-[150px]">
        {words.length > 0 ? words.map((word, index) => (
          <span key={index} className="inline-flex items-center mr-4 mb-2">
            <span
              onClick={() => translateWord(word)}
              className="cursor-pointer py-1 px-2 rounded-md text-gray-800 bg-gray-100 hover:bg-blue-100 transition-colors font-medium"
            >
              {word}
            </span>
            <button
              onClick={(e) => speakEnglish(e, word)}
              className="bg-transparent border-none cursor-pointer text-sm p-1 text-blue-500 hover:text-blue-700 ml-1"
            >
              🔈
            </button>
          </span>
        )) : <p className="text-gray-400 text-center text-base">Your text will appear here as clickable words...</p>}
      </div>

      {clickedWord && (
        <div className="mt-8 p-5 text-center bg-green-50 rounded-2xl border border-green-200">
          <div className="text-sm text-gray-600">Word: <span className="text-green-800 font-bold">{clickedWord}</span></div>
          <div className="text-3xl font-bold text-green-700 mt-2 flex items-center justify-center gap-4">
            {loading ? '...' : translation}
            {!loading && (
              <button 
                onClick={() => speakHindi(translation)}
                className="bg-transparent border-none text-2xl cursor-pointer text-green-600 hover:text-green-800"
              >
                🔊
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Audios3Bolkar;
