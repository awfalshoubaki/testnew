
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ANIMALS, ROUNDS_PER_GAME } from './constants';
import { Animal, GameStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [options, setOptions] = useState<Animal[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // وظيفة تشغيل الصوت مع معالجة أخطاء المتصفح
  const playAnimalSound = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.load();
      setIsPlaying(true);
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {})
          .catch(error => {
            console.error("خطأ في تشغيل الصوت:", error);
            setIsPlaying(false);
          });
      }
    }
  };

  const nextRound = useCallback(() => {
    setFeedback(null);
    setIsPlaying(false);
    
    // اختيار عشوائي للحيوان الصحيح
    const shuffled = [...ANIMALS].sort(() => 0.5 - Math.random());
    const selected = shuffled[0];
    
    // اختيار 4 خيارات تشمل الحيوان الصحيح
    const choices = shuffled.slice(0, 4).sort(() => 0.5 - Math.random());
    
    setCurrentAnimal(selected);
    setOptions(choices);
    setStatus(GameStatus.PLAYING);
    
    // تشغيل الصوت تلقائياً بعد نصف ثانية من بدء الجولة
    setTimeout(() => {
      playAnimalSound(selected.soundPrompt);
    }, 600);
  }, []);

  const initGame = () => {
    setScore(0);
    setRound(1);
    nextRound();
  };

  const handleChoice = (animal: Animal) => {
    if (feedback || isPlaying) return; 

    if (animal.id === currentAnimal?.id) {
      setScore(prev => prev + 1);
      setFeedback({ isCorrect: true, message: "أحسنت! إجابة صحيحة 🌟" });
      
      setTimeout(() => {
        if (round < ROUNDS_PER_GAME) {
          setRound(prev => prev + 1);
          nextRound();
        } else {
          setStatus(GameStatus.GAME_OVER);
        }
      }, 1600);
    } else {
      setFeedback({ isCorrect: false, message: "حاول مرة أخرى يا بطل 🍎" });
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  return (
    <div className="max-w-md w-full min-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-300 flex flex-col">
      {/* عنصر الصوت المخفي */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)} 
        preload="auto"
      />

      {/* الرأس - العدادات */}
      <div className="bg-yellow-400 p-5 text-center shadow-inner">
        <h1 className="text-2xl font-kids text-white drop-shadow-md">خمن صوت الحيوان</h1>
        <div className="flex justify-between mt-3 text-white font-bold" dir="rtl">
          <span className="bg-orange-500 px-4 py-1 rounded-full shadow-md text-sm">الجولة {round} من {ROUNDS_PER_GAME}</span>
          <span className="bg-green-500 px-4 py-1 rounded-full shadow-md text-sm">النقاط: {score}</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
        {status === GameStatus.START && (
          <div className="text-center animate-fade-in">
            <div className="text-8xl mb-8 bounce">🐱🐶🐯</div>
            <h2 className="text-2xl font-kids text-gray-700 mb-8 leading-relaxed px-4">مرحباً بك! استمع للصوت واختر الحيوان الصحيح</h2>
            <button 
              onClick={initGame}
              className="bg-green-500 hover:bg-green-600 text-white text-2xl font-kids py-5 px-12 rounded-full shadow-xl transform transition active:scale-90 border-b-8 border-green-700"
            >
              هيا نلعب!
            </button>
          </div>
        )}

        {status === GameStatus.PLAYING && (
          <div className="w-full animate-fade-in">
            <div className="flex flex-col items-center mb-8">
              <button 
                onClick={() => currentAnimal && playAnimalSound(currentAnimal.soundPrompt)}
                disabled={isPlaying}
                className={`w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all transform ${isPlaying ? 'bg-orange-300 scale-110' : 'bg-blue-500 hover:bg-blue-600 active:scale-95 border-b-8 border-blue-700'}`}
              >
                {isPlaying ? (
                  <div className="flex space-x-1 items-end h-10">
                    <div className="w-2 bg-white animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 bg-white animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 bg-white animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                ) : (
                  <i className="fas fa-volume-up text-6xl text-white"></i>
                )}
              </button>
              <p className="mt-5 font-kids text-blue-600 text-xl animate-pulse">من صاحب هذا الصوت؟</p>
            </div>

            <div className="grid grid-cols-2 gap-4 px-2">
              {options.map((animal) => (
                <button
                  key={animal.id}
                  onClick={() => handleChoice(animal)}
                  disabled={!!feedback || isPlaying}
                  className={`${animal.color} p-5 rounded-3xl shadow-lg border-4 border-white hover:border-yellow-400 transition-all transform active:scale-90 disabled:opacity-80 flex flex-col items-center justify-center`}
                >
                  <span className="text-6xl mb-2">{animal.emoji}</span>
                  <span className="font-kids text-gray-800 text-lg">{animal.name === 'Lion' ? 'أسد' : 
                                                                     animal.name === 'Elephant' ? 'فيل' :
                                                                     animal.name === 'Cow' ? 'بقرة' :
                                                                     animal.name === 'Duck' ? 'بطة' :
                                                                     animal.name === 'Monkey' ? 'قرد' :
                                                                     animal.name === 'Rooster' ? 'ديك' :
                                                                     animal.name === 'Frog' ? 'ضفدع' :
                                                                     animal.name === 'Cat' ? 'قطة' :
                                                                     animal.name === 'Dog' ? 'كلب' : 'خروف'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {status === GameStatus.GAME_OVER && (
          <div className="text-center animate-fade-in">
            <div className="text-9xl mb-6">🎈</div>
            <h2 className="text-3xl font-kids text-gray-800 mb-2">رائع جداً!</h2>
            <p className="text-xl text-gray-600 mb-10 font-kids px-6">لقد جمعت {score} نجوم من أصل {ROUNDS_PER_GAME}!</p>
            <button 
              onClick={initGame}
              className="bg-orange-500 hover:bg-orange-600 text-white text-2xl font-kids py-5 px-12 rounded-full shadow-xl transform transition active:scale-95 border-b-8 border-orange-700"
            >
              العب مرة أخرى
            </button>
          </div>
        )}

        {/* غطاء التغذية الراجعة */}
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20 rounded-3xl animate-fade-in">
            <div className="text-center">
               <div className="text-9xl mb-6 transform scale-125">
                 {feedback.isCorrect ? '✨' : '💫'}
               </div>
               <h2 className={`text-4xl font-kids px-6 leading-tight ${feedback.isCorrect ? 'text-green-500' : 'text-orange-500'}`}>
                 {feedback.message}
               </h2>
            </div>
          </div>
        )}
      </div>

      {/* تذييل الصفحة */}
      <div className="bg-gray-50 py-4 text-center text-gray-400 text-sm font-medium border-t">
        لعبة تعليمية ممتعة للأطفال 
      </div>
    </div>
  );
};

export default App;
