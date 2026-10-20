import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Compass,
  FilePlus,
  CheckCircle2,
  HelpCircle,
  Minimize2
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ParsedAction {
  type: 'navigate' | 'action';
  target: string;
  label: string;
}

interface SalesOpsChatbotProps {
  onOpenNewTask: () => void;
  onOpenNewQuote: () => void;
}

const SCREEN_LABELS: Record<string, string> = {
  overview: 'Genel Bakış',
  tasks: 'İş Kuyruğu',
  quotations: 'Teklifler',
  contracts: 'Sözleşmeler',
  documents: 'Evraklar',
  disputes: 'İtirazlar',
  delivery: 'Teslimat',
  credit: 'Kredi & KKB',
  prebilling: 'HGS & Ceza',
  customerportal: 'Müşteri Portalı',
  automation: 'Otomasyon',
  analytics: 'Analitik',
  datasources: 'Entegrasyonlar',
  settings: 'Ayarlar'
};

const SUGGESTED_QUESTIONS = [
  '🔍 Teklif oluşturma ekranı nerede?',
  '🚚 Teslimat ve hazırlık adımları neler?',
  '🛡️ KKB risk skoru ve teminat şartı nedir?',
  '🧾 HGS ve trafik cezası nasıl yansıtılır?',
  '📋 Yeni bir operasyonel görev aç'
];

export const SalesOpsChatbot: React.FC<SalesOpsChatbotProps> = ({
  onOpenNewTask,
  onOpenNewQuote
}) => {
  const { activePage, setActivePage } = useSalesOps();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Merhaba! Ben **SalesOps Akıllı Rehber & Asistanı**'yım. 🚗✨\n\nFilo kiralama satış operasyonları, teklif hazırlama, teslimat aşamaları, KKB/Findeks risk skorları, HGS/ceza ön faturalama veya aradığınız herhangi bir ekran hakkında bana danışabilirsiniz.\n\nNasıl yardımcı olabilirim?`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Parse action tags from content: [NAVIGATE:target:Label] or [ACTION:target:Label]
  const parseMessageContent = (content: string) => {
    const actionRegex = /\[(NAVIGATE|ACTION):([^:]+):([^\]]+)\]/g;
    const actions: ParsedAction[] = [];
    let match;

    while ((match = actionRegex.exec(content)) !== null) {
      actions.push({
        type: match[1].toLowerCase() as 'navigate' | 'action',
        target: match[2].trim(),
        label: match[3].trim()
      });
    }

    // Clean text for display
    const cleanText = content.replace(actionRegex, '').trim();

    return { cleanText, actions };
  };

  const handleExecuteAction = (action: ParsedAction) => {
    if (action.type === 'navigate') {
      setActivePage(action.target);
      const screenName = SCREEN_LABELS[action.target] || action.target;
      setLastActionFeedback(`"${screenName}" ekranına yönlendirildiniz.`);
      setTimeout(() => setLastActionFeedback(null), 3000);
    } else if (action.type === 'action') {
      if (action.target === 'open_quote') {
        onOpenNewQuote();
        setLastActionFeedback('Otomatik Teklif Oluşturucu açıldı.');
        setTimeout(() => setLastActionFeedback(null), 3000);
      } else if (action.target === 'open_task') {
        onOpenNewTask();
        setLastActionFeedback('Yeni Görev Oluşturma penceresi açıldı.');
        setTimeout(() => setLastActionFeedback(null), 3000);
      }
    }
  };

  const handleSendMessage = async (userText?: string) => {
    const textToSend = (userText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call server-side API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: newMessages.map(m => ({ role: m.role, content: m.content })),
          currentScreen: activePage
        })
      });

      if (!response.ok) {
        throw new Error(`API Hatası: ${response.statusText}`);
      }

      const data = await response.json();
      const botReply = data.reply || 'İsteğinizi işlerken bir sorun oluştu. Lütfen tekrar deneyin.';

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: botReply,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `Bağlantı sırasında bir aksaklık oluştu, ancak size doğrudan aradığınız ekranla ilgili yardımcı olabilirim:\n\n` +
            `• **Teklif Yönetimi**: [NAVIGATE:quotations:Teklif Yönetimine Git]\n` +
            `• **İş Kuyruğu**: [NAVIGATE:tasks:İş Kuyruğuna Git]\n` +
            `• **Teslimat & Hazırlık**: [NAVIGATE:delivery:Teslimat Takibine Git]\n` +
            `• **Finansal İstihbarat & KKB**: [NAVIGATE:credit:Finansal İstihbarata Git]\n` +
            `• **HGS & Ceza Ön Fatura**: [NAVIGATE:prebilling:HGS & Ceza Ön Faturaya Git]`,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Sohbet geçmişi sıfırlandı. Aradığınız bir ekran veya danışmak istediğiniz filo operasyon süreci varsa yardımcı olmaya hazırım!`,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Action Toast Feedback */}
      {lastActionFeedback && (
        <div className="fixed bottom-24 right-6 z-50 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{lastActionFeedback}</span>
        </div>
      )}

      {/* Floating Launcher Button (Sağ Altta) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {showTooltip && (
            <div className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 animate-bounce duration-1000">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Ekran veya süreç arıyorsanız danışabilirsiniz!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-slate-400 hover:text-slate-600 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            aria-label="SalesOps Asistanı ve Rehber"
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {/* Ping animation indicator */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>

            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold tracking-wide pr-1">
              SalesOps Asistanı
            </span>
          </button>
        </div>
      )}

      {/* Chat Window Popover */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">
                    SalesOps Akıllı Rehber
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono border border-blue-400/20">
                    AI Destekli
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  Ekran arama, süreç rehberliği ve hızlı işlem
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Sohbeti Temizle"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Kapat"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Screen Context Indicator */}
          <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-400">Şu anki ekran:</span>
              <span className="font-semibold text-slate-800 truncate">
                {SCREEN_LABELS[activePage] || activePage}
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
              Çevrimiçi
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              const { cleanText, actions } = parseMessageContent(msg.content);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[90%]">
                    {isAssistant && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mb-1">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                        isAssistant
                          ? 'bg-white text-slate-800 border border-slate-200'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {/* Render text with line breaks and markdown boldness */}
                      <div className="space-y-1.5 whitespace-pre-wrap">
                        {cleanText.split('\n').map((line, i) => {
                          if (!line.trim()) return <div key={i} className="h-1" />;

                          // Handle bullet points
                          const isBullet = line.startsWith('•') || line.startsWith('-');
                          const content = isBullet ? line.replace(/^[•-]\s*/, '') : line;

                          // Parse **bold** parts
                          const parts = content.split(/(\*\*[^*]+\*\*)/g);

                          return (
                            <div
                              key={i}
                              className={isBullet ? 'flex items-start gap-1.5 pl-1' : ''}
                            >
                              {isBullet && <span className="text-blue-500 font-bold">•</span>}
                              <div>
                                {parts.map((p, pi) => {
                                  if (p.startsWith('**') && p.endsWith('**')) {
                                    return (
                                      <strong
                                        key={pi}
                                        className={isAssistant ? 'text-slate-950 font-semibold' : 'font-semibold'}
                                      >
                                        {p.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return <span key={pi}>{p}</span>;
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Interactive Action Deep-Link Buttons */}
                      {actions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                          {actions.map((action, actionIdx) => (
                            <button
                              key={actionIdx}
                              onClick={() => handleExecuteAction(action)}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/90 text-blue-900 border border-blue-200/80 text-[11px] font-semibold transition-all group cursor-pointer text-left shadow-xs"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {action.type === 'navigate' ? (
                                  <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                ) : (
                                  <FilePlus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                )}
                                <span className="truncate">{action.label}</span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-blue-600 transform group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      <span
                        className={`block text-[9px] mt-1 text-right ${
                          isAssistant ? 'text-slate-400' : 'text-blue-100'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-blue-600 animate-spin" />
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse delay-300"></span>
                  <span className="text-[11px] text-slate-500 font-medium ml-1">Yanıt hazırlanıyor...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions (if only 1 or 2 messages) */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Hızlı Sorular & Ekranlar
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ekran arayın veya süreç hakkında soru sorun..."
                  className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                  inputMessage.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title="Gönder"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] text-slate-400">
              <span>Enter tuşu ile gönderin</span>
              <span>14 Modül & Operasyon Rehberi</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
