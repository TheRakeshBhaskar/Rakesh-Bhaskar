
import React, { useState, useRef, useEffect } from 'react';
import { geminiService, MARATHI_VOICES } from './services/geminiService';
import { AppStatus } from './types';
import { pcmToWav } from './utils/audioUtils';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(MARATHI_VOICES[0].id);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateProgress = () => {
    if (audioContextRef.current && isPlaying) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      setCurrentTime(Math.min(elapsed, duration));
      
      if (elapsed < duration) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, duration]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("कृपया बातमीचा मजकूर टाका.");
      return;
    }

    setError(null);
    setAudioBlob(null);
    setGeneratedScript('');
    setStatus(AppStatus.GENERATING_SCRIPT);
    
    try {
      const script = await geminiService.generateNewsScript(inputText);
      setGeneratedScript(script);
      setStatus(AppStatus.GENERATING_AUDIO);

      const { buffer, rawPcm } = await geminiService.generateSpeech(script, selectedVoice);
      
      // Prepare WAV blob for download and share
      const wav = pcmToWav(rawPcm, 24000);
      setAudioBlob(wav);
      
      playAudio(buffer);
    } catch (err) {
      console.error(err);
      setError("काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.");
      setStatus(AppStatus.ERROR);
    }
  };

  const playAudio = (buffer: AudioBuffer) => {
    stopAudio();

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    setDuration(buffer.duration);
    setCurrentTime(0);
    startTimeRef.current = audioContextRef.current.currentTime;
    
    source.onended = () => {
      setIsPlaying(false);
      setCurrentTime(buffer.duration);
      setStatus(AppStatus.IDLE);
    };

    source.start(0);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    setStatus(AppStatus.PLAYING);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Source might not have started or already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleReset = () => {
    stopAudio();
    setInputText('');
    setGeneratedScript('');
    setAudioBlob(null);
    setCurrentTime(0);
    setDuration(0);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  const downloadAudio = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waartaa_news_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!generatedScript) return;

    const shareData: ShareData = {
      title: 'Waartaa.in News',
      text: generatedScript,
    };

    if (audioBlob && navigator.canShare && navigator.canShare({ files: [new File([audioBlob], 'news.wav', { type: 'audio/wav' })] })) {
      const file = new File([audioBlob], `waartaa_news_${Date.now()}.wav`, { type: 'audio/wav' });
      try {
        await navigator.share({
          ...shareData,
          files: [file]
        });
        return;
      } catch (err) {
        console.error('File share failed, falling back to text share', err);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Text share failed', err);
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(generatedScript)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-orange-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-orange-600 text-white py-6 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Waartaa.in</h1>
            <p className="text-orange-100 text-sm font-medium">गावकुसासाठी तयार</p>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">
            Marathi News AI
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-8">
          <div className="mb-6">
            <label className="block text-lg font-bold text-orange-800 mb-3">
              बातमीचा मजकूर पेस्ट करा
            </label>
            <textarea
              className="w-full h-48 p-4 bg-orange-50/50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none text-lg"
              placeholder="येथे तुमची बातमी लिहा किंवा पेस्ट करा..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={status !== AppStatus.IDLE && status !== AppStatus.ERROR}
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-bold text-orange-800 mb-3">
              आवाज निवडा (Voice Selection)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {MARATHI_VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  disabled={status !== AppStatus.IDLE && status !== AppStatus.ERROR}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedVoice === voice.id
                      ? 'border-orange-600 bg-orange-50 text-orange-700'
                      : 'border-gray-100 hover:border-orange-200 text-gray-600'
                  }`}
                >
                  <div className="font-bold text-sm">{voice.name}</div>
                  <div className="text-xs opacity-70">{voice.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={handleGenerate}
              disabled={status !== AppStatus.IDLE && status !== AppStatus.ERROR || !inputText.trim()}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
                status !== AppStatus.IDLE && status !== AppStatus.ERROR
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700 active:transform active:scale-95'
              }`}
            >
              {(status === AppStatus.GENERATING_SCRIPT || status === AppStatus.GENERATING_AUDIO) && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {status === AppStatus.GENERATING_SCRIPT ? 'बातमी तयार होत आहे...' : 
               status === AppStatus.GENERATING_AUDIO ? 'आवाज तयार होत आहे...' : 'बातमी ऐका'}
            </button>

            {(generatedScript || inputText) && (
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg border-2 border-orange-200 text-orange-600 hover:bg-orange-50 transition-all"
              >
                नवीन बातमी
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-10a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </section>

        {/* Results Section */}
        {generatedScript && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Audio Feedback / Control Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 flex flex-col items-stretch gap-6">
              <div className="flex items-center gap-4 w-full">
                <div className={`relative p-4 rounded-full ${isPlaying ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600'}`}>
                  {isPlaying && <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-50"></div>}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-800 truncate">{isPlaying ? 'बातमी प्रसारित होत आहे' : 'बातमी तयार आहे'}</h3>
                  <p className="text-gray-500 text-sm">Waartaa.in AI न्यूज अँकर</p>
                </div>
                {isPlaying && (
                  <button 
                    onClick={stopAudio}
                    className="bg-red-100 text-red-600 hover:bg-red-200 p-3 rounded-xl transition-all"
                    title="थांबा"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Progress Bar & Timestamps */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-600 transition-all duration-100 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {audioBlob && (
                  <>
                    <button 
                      onClick={downloadAudio}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700 px-6 py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      डाउनलोड करा
                    </button>
                    <button 
                      onClick={handleShare}
                      className="flex-1 bg-orange-100 text-orange-700 hover:bg-orange-200 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      शेअर करा
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Script Display */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-800">न्यूज अँकर स्क्रिप्ट</h2>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">AI Script</span>
              </div>
              <div className="prose prose-orange max-w-none">
                <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap font-medium border-l-4 border-orange-400 pl-6 italic bg-orange-50/30 py-6 rounded-r-xl">
                  {generatedScript}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>© 2024 Waartaa.in - ग्रामीण भागातील प्रत्येक आवाजासाठी तंत्रज्ञान.</p>
        <p className="mt-2 font-semibold">Gemini AI द्वारा समर्थित</p>
      </footer>
    </div>
  );
};

export default App;
