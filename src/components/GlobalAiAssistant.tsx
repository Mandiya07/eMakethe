import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function GlobalAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'ai'|'user', text: string}[]>([
    { sender: 'ai', text: 'Hi! I am the eMakethe AI Assistant. I can help you with product details, direct checkout, secure Escrow payments, and fast 2-hour motorcycle riders. What do you need?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();
  const hideFab = ['/checkout', '/map'].some(path => location.pathname.includes(path));

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const currentInput = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: currentInput }]);
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/ai/customer-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentInput,
          chatHistory: messages.map(m => ({ sender: m.sender, text: m.text }))
          // Since the server handles simple keyword fallback, this will work out-of-the-box
        })
      });
      const data = await response.json();
      if (data && data.response) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "Yebo! I had some trouble compiling your request. Please try typing another question!" }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { sender: 'ai', text: "Yebo! I experienced a connection timeout reaching eMakethe support server. Please make sure the backend is active!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (hideFab) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-indigo-600 text-white p-3.5 rounded-full shadow-xl shadow-indigo-600/30 z-30 group"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Sparkles size={11} className="absolute -top-0.5 -right-0.5 text-yellow-300 animate-pulse" />
        <MessageCircle size={22} className="fill-white/20" />
      </button>

      {isOpen && (
         <div className="fixed inset-x-0 bottom-0 top-0 z-50 flex items-end justify-center pointer-events-none p-4 pb-20 w-full h-full max-w-md mx-auto">
            <div className="bg-black/20 fixed inset-0 z-40 pointer-events-auto backdrop-blur-xs" onClick={() => setIsOpen(false)}></div>
            <div className="bg-white w-full h-[60vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col pointer-events-auto animate-in slide-in-from-bottom overflow-hidden relative z-50">
               <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageCircle size={16} />
                     </div>
                     <div>
                        <h3 className="font-bold text-sm font-display">eMakethe AI Support</h3>
                        <p className="text-[10px] text-indigo-1200 opacity-90">Instant Secure Assistance</p>
                     </div>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
                     <X size={16} />
                  </button>
               </div>
               
               <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
                 {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm leading-relaxed ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm font-normal'}`}>
                          {m.text}
                       </div>
                    </div>
                 ))}
                 {isTyping && (
                    <div className="flex justify-start">
                       <div className="bg-white border border-gray-100 text-indigo-500 rounded-2xl rounded-bl-sm p-3.5 shadow-sm text-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-150"></span>
                       </div>
                    </div>
                 )}
               </div>

               <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
                  <input 
                    type="text" 
                    value={input}
                    disabled={isTyping}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about payments, delivery, products..." 
                    className="flex-1 bg-gray-150 rounded-full px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className={`p-2.5 rounded-full flex shrink-0 items-center justify-center h-10 w-10 transition-colors ${!input.trim() || isTyping ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white'}`}
                  >
                     <Send size={18} className="-ml-0.5" />
                  </button>
               </div>
            </div>
         </div>
      )}
    </>
  );
}
