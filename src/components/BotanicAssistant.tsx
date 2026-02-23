'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  authenticated: boolean;
  user?: {
    level: number;
    points_total: number;
    plant_count: number;
  };
  plants?: Array<{
    nickname: string;
    common_name: string;
    scientific_name: string;
    health_score: number;
    last_watered?: string;
    last_diagnosed?: string;
  }>;
}

export function BotanicAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserContext = async () => {
    setContextLoading(true);
    try {
      const res = await fetch('/api/botanical-context');
      const data = await res.json();
      setUserContext(data);
      
      // Générer le message de bienvenue selon le contexte
      let welcomeMessage = '';
      if (data.authenticated && data.plants && data.plants.length > 0) {
        // Trouver la plante avec le score le plus bas
        const worstPlant = data.plants.reduce((worst: any, current: any) => {
          if (!worst || current.health_score < worst.health_score) {
            return current;
          }
          return worst;
        });
        
        const plantName = worstPlant.nickname || worstPlant.common_name;
        const scientificName = worstPlant.scientific_name || '';
        
        // Générer un fait surprenant via l'API
        try {
          const factRes = await fetch('/api/botanical-assistant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Génère un fait surprenant et court (une phrase maximum) sur ${plantName}${scientificName ? ` (${scientificName})` : ''}. Le fait doit être fascinant, inattendu, sur la biologie, l'évolution, l'histoire ou un aspect surprenant de cette plante. Réponds UNIQUEMENT avec le fait, sans "Tu savais que" ni ponctuation finale.`,
              history: [],
              userContext: null,
            }),
          });
          
          const factData = await factRes.json();
          let surprisingFact = factData.reply?.trim() || `est une plante fascinante avec une histoire riche`;
          
          // Nettoyer le fait (enlever "Tu savais que" si présent, enlever ponctuation finale)
          surprisingFact = surprisingFact.replace(/^Tu savais que /i, '').replace(/[?.!]$/, '');
          
          welcomeMessage = `Bonjour ! 🌿 Tu savais que ton ${plantName} ${surprisingFact} ?\n\nJe suis là pour te faire découvrir le monde fascinant de tes plantes !`;
        } catch (factError) {
          // Fallback si l'appel API échoue
          welcomeMessage = `Bonjour ! 🌿 Le monde végétal est plein de secrets incroyables.\n\nJe suis là pour te faire découvrir le monde fascinant de tes plantes !`;
        }
      } else {
        welcomeMessage = 'Bonjour ! 🌿 Le monde végétal est plein de secrets incroyables.\n\nQuelle plante t\'intéresse ?';
      }
      
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    } catch (error) {
      console.error('Erreur chargement contexte:', error);
      setMessages([{
        role: 'assistant',
        content: 'Bonjour ! 🌿 Le monde végétal est plein de secrets incroyables.\n\nQuelle plante t\'intéresse ?',
      }]);
    } finally {
      setContextLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !userContext && !contextLoading) {
      loadUserContext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Masquer la navbar quand le chat est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }
    return () => {
      document.body.classList.remove('chat-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus sur l'input quand le panel s'ouvre
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/botanical-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la requête');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 z-[1000] flex h-[60px] w-[60px] items-center justify-center rounded-full text-2xl text-white transition-all hover:scale-110 active:scale-95"
          style={{
            backgroundColor: '#5B8C5A',
            boxShadow: '0 4px 20px rgba(91, 140, 90, 0.4)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
          aria-label="Ouvrir l'assistant botanique"
        >
          🌿
        </button>
      )}

      {/* Panel de chat */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] flex flex-col animate-fadeIn"
          style={{
            backgroundColor: '#F5F0E8',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{
              backgroundColor: '#5B8C5A',
            }}
          >
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <h2
                  className="font-serif text-xl font-bold text-white"
                  style={{ fontSize: '1.25rem' }}
                >
                  Fab
                </h2>
              </div>
              <p className="text-sm text-white" style={{ opacity: 0.8 }}>
                Pose toutes tes questions sur les plantes
              </p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                // Réinitialiser le contexte et les messages pour recharger au prochain ouverture
                setUserContext(null);
                setMessages([]);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-white transition-all hover:bg-white/20 active:scale-95"
              aria-label="Fermer l'assistant"
            >
              ✕
            </button>
          </div>

          {/* Zone de messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-4">
              {contextLoading && messages.length === 0 && (
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ backgroundColor: '#5B8C5A' }}
                  >
                    🌿
                  </div>
                  <div
                    className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm"
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <div className="flex gap-1">
                      <span
                        className="h-2 w-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: '#5B8C5A',
                          animation: 'bounce 1.4s ease-in-out infinite',
                        }}
                      />
                      <span
                        className="h-2 w-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: '#5B8C5A',
                          animation: 'bounce 1.4s ease-in-out infinite',
                          animationDelay: '0.2s',
                        }}
                      />
                      <span
                        className="h-2 w-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: '#5B8C5A',
                          animation: 'bounce 1.4s ease-in-out infinite',
                          animationDelay: '0.4s',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                      style={{ backgroundColor: '#5B8C5A' }}
                    >
                      🌿
                    </div>
                  )}
                  <div
                    className={`selectable max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'rounded-br-md text-white'
                        : 'rounded-bl-md bg-white text-[#52414C]'
                    }`}
                    style={{
                      backgroundColor: message.role === 'user' ? '#5B8C5A' : 'white',
                      color: message.role === 'user' ? 'white' : '#52414C',
                      boxShadow:
                        message.role === 'assistant'
                          ? '0 2px 8px rgba(0, 0, 0, 0.08)'
                          : 'none',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <div className="h-8 w-8 shrink-0" />
                  )}
                </div>
              ))}

              {/* Indicateur de frappe */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ backgroundColor: '#5B8C5A' }}
                  >
                    🌿
                  </div>
                  <div
                    className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm"
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <div className="flex gap-1">
                      <span
                        className="h-2 w-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: '#5B8C5A',
                          animation: 'bounce 1.4s ease-in-out infinite',
                        }}
                      />
                      <span
                        className="h-2 w-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: '#5B8C5A',
                          animation: 'bounce 1.4s ease-in-out infinite',
                          animationDelay: '0.2s',
                        }}
                      />
                      <span
                        className="h-2 w-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: '#5B8C5A',
                          animation: 'bounce 1.4s ease-in-out infinite',
                          animationDelay: '0.4s',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Zone de saisie */}
          <div
            className="flex items-center gap-3 border-t px-6 py-4"
            style={{
              backgroundColor: 'white',
              borderColor: 'rgba(0, 0, 0, 0.08)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Demande-moi n'importe quoi sur les plantes..."
              disabled={isLoading}
              className="flex-1 rounded-full px-4 py-3 text-sm outline-none disabled:opacity-50"
              style={{
                backgroundColor: '#F5F0E8',
                border: 'none',
                color: '#52414C',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                backgroundColor: '#5B8C5A',
              }}
              aria-label="Envoyer le message"
            >
              →
            </button>
          </div>
        </div>
      )}

    </>
  );
}
