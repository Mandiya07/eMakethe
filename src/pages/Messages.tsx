import { Search, MessageCircle } from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { Link } from 'react-router-dom';

export default function Messages() {
  const { sellers } = useFirebase();
  const chats = sellers.slice(0, 0); // No hardcoded demo chats

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
        {chats.length > 0 ? (
          chats.map(chat => (
            <Link to={`/shop/${chat.id}`} key={chat.id} className="bg-white p-4 border-b border-gray-50 flex items-center gap-3 w-full active:bg-gray-50">
               <div className="relative">
                  {chat.logoUrl?.length <= 2 ? (
                    <div className="w-12 h-12 rounded-full border border-gray-200 bg-emerald-50 flex items-center justify-center text-xl shrink-0">
                      {chat.logoUrl || '🥬'}
                    </div>
                  ) : (
                    <img src={chat.logoUrl} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                  )}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 text-sm">{chat.name}</h3>
                    <span className="text-[10px] text-gray-400 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500 line-clamp-1 flex-1 pr-4">Chat on WhatsApp or view shop</p>
                  </div>
               </div>
            </Link>
          ))
        ) : (
          <div className="mt-12 px-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mb-3">
              <MessageCircle size={32} />
            </div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">Direct WhatsApp Communication</h3>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-4">
              Connect directly with local sellers on WhatsApp for orders, inquiries, and custom delivery arrangements.
            </p>
            <Link 
              to="/"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              Browse Sellers & Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
