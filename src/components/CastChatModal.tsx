import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TMDBCastMember } from '../services/tmdb';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface CastChatModalProps {
  open: boolean;
  onClose: () => void;
  castMember: TMDBCastMember;
  movieTitle: string;
  onSendMessage: (message: string) => Promise<string>;
}

const CastChatModal: React.FC<CastChatModalProps> = ({
  open,
  onClose,
  castMember,
  movieTitle,
  onSendMessage
}) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message when chat opens
  useEffect(() => {
    if (open && messages.length === 0) {
      const currentLanguage = i18n.language || 'tr';
      let welcomeText = '';
      
      switch (currentLanguage) {
        case 'tr':
          welcomeText = `Merhaba! Ben ${castMember.name}, "${movieTitle}" filminde ${castMember.character} karakterini canlandırıyorum. Film veya karakterim hakkında ne öğrenmek istersin?`;
          break;
        case 'es':
          welcomeText = `¡Hola! Soy ${castMember.name}, interpretando a ${castMember.character} en "${movieTitle}". ¿Qué te gustaría saber sobre la película o mi personaje?`;
          break;
        default:
          welcomeText = `Hi! I'm ${castMember.name}, playing ${castMember.character} in "${movieTitle}". What would you like to know about the movie or my character?`;
      }
      
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: welcomeText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [open, castMember, movieTitle, messages.length, i18n.language]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(inputMessage.trim());
      const castMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, castMessage]);
    } catch (error) {
      const currentLanguage = i18n.language || 'tr';
      let errorText = '';
      
      switch (currentLanguage) {
        case 'tr':
          errorText = "Üzgünüm, şu anda yanıt vermekte zorlanıyorum. Lütfen tekrar deneyin.";
          break;
        case 'es':
          errorText = "Lo siento, estoy teniendo problemas para responder en este momento. Por favor, inténtalo de nuevo.";
          break;
        default:
          errorText = "Sorry, I'm having trouble responding right now. Please try again.";
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Placeholder text'i dile göre ayarla
  const getPlaceholderText = () => {
    const currentLanguage = i18n.language || 'tr';
    switch (currentLanguage) {
      case 'tr':
        return 'Mesajınızı yazın...';
      case 'es':
        return 'Escribe tu mensaje...';
      default:
        return 'Type your message...';
    }
  };

  // Typing text'i dile göre ayarla
  const getTypingText = () => {
    const currentLanguage = i18n.language || 'tr';
    switch (currentLanguage) {
      case 'tr':
        return 'Yazıyor...';
      case 'es':
        return 'Escribiendo...';
      default:
        return 'Typing...';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-[#222] rounded-[16px] shadow-[0_8px_24px_0_rgba(0,0,0,0.15)] w-[90vw] max-w-[400px] h-[80vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[#333]">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white hover:text-[#FE7743] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Cast Member Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#555]">
              {castMember.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${castMember.profile_path}`}
                  alt={castMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  {castMember.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-poppins text-[14px] font-semibold">{castMember.name}</p>
              <p className="text-[#EFEEEA] font-poppins text-[12px]">{castMember.character}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-[12px] ${
                  message.isUser
                    ? 'bg-[#FE7743] text-white'
                    : 'bg-[#333] text-[#EFEEEA]'
                }`}
              >
                <p className="font-poppins text-[14px] leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-white/70' : 'text-[#EFEEEA]/70'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#333] text-[#EFEEEA] p-3 rounded-[12px]">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#FE7743] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#FE7743] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#FE7743] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs">{getTypingText()}</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#333]">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              className="flex-1 bg-[#333] text-white rounded-[12px] p-3 font-poppins text-[14px] resize-none outline-none border-none"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="w-12 h-12 bg-[#FE7743] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e66a3a] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CastChatModal; 