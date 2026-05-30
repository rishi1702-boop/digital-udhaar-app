import { useLanguage } from '../context/LanguageContext';
import API from '../api/axios';

const useVoiceEntry = () => {
  const { lang } = useLanguage();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const isSupported = !!SpeechRecognition;

  const startListening = () => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript.trim();
        try {
          const { data } = await API.post('/voice/parse', { transcript });
          resolve({ transcript, ...data.data });
        } catch (error) {
          reject(new Error('AI could not parse the voice command. Please try again.'));
        }
      };

      recognition.onerror = (event) => {
        reject(new Error(event.error));
      };

      recognition.onend = () => {};

      recognition.start();
    });
  };

  return { isSupported, startListening };
};

export default useVoiceEntry;
