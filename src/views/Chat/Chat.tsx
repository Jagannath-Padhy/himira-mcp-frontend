import { useState } from 'react';
import { AppLayout, Sidebar, Header } from '@components';
import ChatArea from './ChatArea';
import { ChatMessage, ChatSession } from '@interfaces';

export default function Chat() {
  const [chats, setChats] = useState<ChatSession[]>([
    { id: 'c1', title: 'New Chat', messages: [] },
  ]);
  const [activeChatId, setActiveChatId] = useState('c1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId)!;

  const createChat = () => {
    const id = `c${Date.now()}`;
    setChats((prev) => [...prev, { id, title: 'New Chat', messages: [] }]);
    setActiveChatId(id);
  };

  const deleteChat = (id: string) => {
    setChats((prev) => {
      if (prev.length === 1) return prev;
      const updated = prev.filter((c) => c.id !== id);
      if (activeChatId === id) setActiveChatId(updated[0].id);
      return updated;
    });
  };

  const switchChat = (id: string) => setActiveChatId(id);

  const sendMessage = (msg: string) => {
    const newMsg: ChatMessage = { id: `m${Date.now()}`, type: 'user', content: msg };

    const botReply: ChatMessage = {
      id: `b${Date.now()}`,
      type: 'bot',
      content: 'Sure! Here are some laptops under ₹70,000 👇',
    };

    const botProducts: ChatMessage = {
      id: `bp${Date.now()}`,
      type: 'bot_product_list',
      products: [
        {
          id: 'p1',
          name: 'MacBook Air M1',
          price: '₹65,000',
          imageUrl:
            'https://images.unsplash.com/photo-1651746817904-abc832733480?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          link: 'https://www.apple.com/in/macbook-air-m1/',
          description: 'Lightweight and powerful with Apple M1 chip.',
        },
        {
          id: 'p2',
          name: 'Dell XPS 13',
          price: '₹68,000',
          imageUrl:
            'https://images.unsplash.com/photo-1651746817904-abc832733480?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          link: 'https://www.dell.com/en-in/shop/laptops/xps-13-laptop/spd/xps-13-9310-laptop',
          description: 'Compact premium laptop with InfinityEdge display.',
        },
        {
          id: 'p3',
          name: 'HP Pavilion 14',
          price: '₹62,000',
          imageUrl:
            'https://images.unsplash.com/photo-1651746817904-abc832733480?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          link: 'https://www.hp.com/in-en/shop/hp-pavilion-14-laptop-14-dv2074tu-6k3u4pa.html',
          description: 'Great performance for students with Intel i5 processor.',
        },
      ],
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, newMsg, botReply, botProducts] }
          : c,
      ),
    );
  };

  return (
    <AppLayout
      sidebar={
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onCreate={createChat}
          onDelete={deleteChat}
          onSwitch={switchChat}
        />
      }
      header={<Header onMenuClick={() => setMobileSidebarOpen(true)} />}
      mobileSidebarOpen={mobileSidebarOpen}
      onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
    >
      <ChatArea messages={activeChat.messages} onSend={sendMessage} />
    </AppLayout>
  );
}
