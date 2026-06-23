import { Search, MessageCircle } from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { Link } from 'react-router-dom';

export default function Messages() {
  const { sellers } = useFirebase();
  const chats = [
    { id: '1', seller: sellers.find(s => s.id === 's1') || sellers[0], lastMessage: 'Yes, we have 10kg available.', time: '10:45 AM', unread: 2 }
  ].filter(c => c.seller);

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="bg-white px-4 py-4 shadow-sm border-b border-gray-100 sticky top-0 z-10 w-full">
        <h1 className="text-lg font-bold text-gray-800 mb-3">Messages</h1>
        <div className="bg-gray-100 rounded-xl flex items-center px-4 py-2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search chats..." 
            className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col w-full pb-8">
        {chats.map(chat => (
          <Link to={`/shop/${chat.seller.id}`} key={chat.id} className="bg-white p-4 border-b border-gray-50 flex items-center gap-3 w-full active:bg-gray-50">
             <div className="relative">
                {chat.seller.logoUrl?.length <= 2 ? (
                  <div className="w-12 h-12 rounded-full border border-gray-200 bg-emerald-50 flex items-center justify-center text-xl shrink-0">
                    {chat.seller.logoUrl || '🥬'}
                  </div>
                ) : (
                  <img src={chat.seller.logoUrl} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                )}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 text-sm">{chat.seller.name}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 line-clamp-1 flex-1 pr-4">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
             </div>
          </Link>
        ))}

        <div className="mt-8 px-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mb-3">
              <MessageCircle size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">WhatsApp Integration</h3>
            <p className="text-xs text-gray-500">
              When communicating with new sellers, eMakethe will automatically open WhatsApp for a seamless chat experience.
            </p>
        </div>
      </div>
    </div>
  );
}
