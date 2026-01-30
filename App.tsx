
import React, { useState, useEffect } from "react";
import LearnWithAudio from "./components/LearnWithAudio";
import LearnWithAudioEnglish from "./components/LearnWithAudioEnglish";
import Audios3Bolkar from "./components/Audios3Bolkar";
import HindiToSanskritAudio from "./components/HindiToSanskritAudio";


const AD_URL = "https://www.effectivegatecpm.com/ynr4zqfyc?key=47c7532215e22f2958124a99aa5ab73e";

type Page = "hindiToEnglish" | "englishToHindi" | "wordTranslator" | "hindiToSanskrit";

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page | null>(null);
  const [adShown, setAdShown] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    // FIX: Changed NodeJS.Timeout to `any` for browser environments.
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOpen = (pageName: Page) => {
    if (adShown) {
      setActivePage(pageName);
      return;
    }

    window.open(AD_URL, "_blank");
    setAdShown(true);
    setActivePage(pageName);
    setTimer(5);
  };
  
  const goHome = () => {
      setActivePage(null);
      // Reset timer if user navigates back during countdown
      if(timer > 0) {
          setTimer(0);
      }
  };

  if (timer > 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center flex-col font-sans bg-gray-100 text-gray-800">
        <h2 className="text-2xl font-bold mb-2 text-center">Ad opened in new tab</h2>
        <p className="text-lg">Opening page in {timer} seconds...</p>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case "hindiToEnglish":
        return <LearnWithAudio onBack={goHome} />;
      case "englishToHindi":
        return <LearnWithAudioEnglish onBack={goHome} />;
      case "wordTranslator":
        return <Audios3Bolkar onBack={goHome} />;
      case "hindiToSanskrit":
        return <HindiToSanskritAudio onBack={goHome} />;
      default:
        return null;
    }
  }

  return (
    <main className="bg-slate-900 w-screen h-screen text-white font-sans">
      {!activePage ? (
        <div className="h-full flex flex-col justify-center items-center p-4">
            <h1 className="text-2xl font-bold mb-8 text-center text-cyan-400">MyTeacher Voice Translator</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                <button 
                    onClick={() => handleOpen("hindiToEnglish")}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    Hindi → English Practice
                </button>
                <button 
                    onClick={() => handleOpen("englishToHindi")}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    English → Hindi Practice
                </button>
                <button 
                    onClick={() => handleOpen("wordTranslator")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    Word Translator
                </button>
                <button 
                    onClick={() => handleOpen("hindiToSanskrit")}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    Hindi → Sanskrit Practice
                </button>
            </div>
        </div>
      ) : (
        renderActivePage()
      )}
    </main>
  );
}

export default App;