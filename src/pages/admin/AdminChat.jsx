import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { 
  Send, Paperclip, Mic, Square, User, Search, Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { chatApi } from '../../api/chatApi';
import toast from 'react-hot-toast';
import './AdminChat.css';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AdminChat() {
  const { accessToken, user } = useSelector((s) => s.auth);
  const [socket, setSocket] = useState(null);
  
  const [conversations, setConversations] = useState([]);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  // Load conversations
  useEffect(() => {
    chatApi.getConversations().then(res => {
      setConversations(res.data.conversations);
    }).catch(console.error);
  }, []);

  // Socket init
  useEffect(() => {
    if (accessToken) {
      const newSocket = io(SOCKET_URL, { auth: { token: accessToken } });
      newSocket.on('connect', () => console.log('Admin Chat connected'));
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [accessToken]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      // If message belongs to active customer, append it
      if (activeCustomer && message.customer === activeCustomer._id) {
        setMessages(prev => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      }
      
      // Update conversations list (move to top, update lastMessage)
      setConversations(prev => {
        const exists = prev.find(c => c.customer._id === message.customer);
        if (exists) {
          const updated = prev.map(c => 
            c.customer._id === message.customer 
              ? { ...c, lastMessage: message } 
              : c
          );
          return updated.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
        } else {
          chatApi.getConversations().then(res => setConversations(res.data.conversations));
          return prev;
        }
      });
    };

    socket.on('receive_message', handleReceiveMessage);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, activeCustomer]);

  // Load active conversation history
  useEffect(() => {
    if (activeCustomer) {
      chatApi.getHistory(activeCustomer._id).then(res => {
        setMessages(res.data.messages);
        setTimeout(scrollToBottom, 100);
      }).catch(console.error);
    }
  }, [activeCustomer]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text = '', mediaUrl = '', mediaType = 'none') => {
    if ((!text.trim() && !mediaUrl) || !socket || !activeCustomer) return;
    
    socket.emit('send_message', {
      text,
      mediaUrl,
      mediaType,
      receiverId: activeCustomer._id,
      customerId: activeCustomer._id,
    });
    
    setInputText('');
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    setIsUploading(true);
    try {
      const res = await chatApi.uploadMedia(formData);
      sendMessage('', res.data.mediaUrl, res.data.mediaType);
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Voice Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append('media', file);
        
        setIsUploading(true);
        try {
          const res = await chatApi.uploadMedia(formData);
          sendMessage('', res.data.mediaUrl, 'audio');
        } catch (err) {
          toast.error('Failed to send voice note');
        } finally {
          setIsUploading(false);
          setRecordingTime(0);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="admin-chat-layout">
      {/* Sidebar */}
      <div className="admin-chat-sidebar">
        <div className="sidebar-header">
          <h2>Conversations</h2>
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search customers..." />
          </div>
        </div>
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div 
              key={conv.customer._id}
              className={`conversation-item ${activeCustomer?._id === conv.customer._id ? 'active' : ''}`}
              onClick={() => setActiveCustomer(conv.customer)}
            >
              <div className="conv-avatar">{conv.customer.name[0]}</div>
              <div className="conv-info">
                <div className="conv-header">
                  <h4>{conv.customer.name}</h4>
                  <span className="conv-time">
                    {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                  </span>
                </div>
                <p className="conv-preview">
                  {conv.lastMessage.text || `Sent a ${conv.lastMessage.mediaType}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="admin-chat-main">
        {activeCustomer ? (
          <>
            <div className="main-header">
              <div className="conv-avatar">{activeCustomer.name[0]}</div>
              <div>
                <h3>{activeCustomer.name}</h3>
                <span>{activeCustomer.email}</span>
              </div>
            </div>

            <div className="main-messages">
              {messages.map((msg, i) => {
                const senderId = msg.sender?._id || msg.sender;
                const isMine = senderId === user._id;
                return (
                  <div key={msg._id || i} className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                    <div className="message-content">
                      {msg.mediaUrl && (
                        <div className="message-media">
                          {msg.mediaType === 'image' && (
                            <img src={`${SOCKET_URL}${msg.mediaUrl}`} alt="Attachment" loading="lazy" />
                          )}
                          {msg.mediaType === 'video' && (
                            <video src={`${SOCKET_URL}${msg.mediaUrl}`} controls />
                          )}
                          {msg.mediaType === 'audio' && (
                            <audio src={`${SOCKET_URL}${msg.mediaUrl}`} controls />
                          )}
                        </div>
                      )}
                      {msg.text && <div className="message-bubble">{msg.text}</div>}
                      <span className="message-time">{format(new Date(msg.createdAt || Date.now()), 'HH:mm')}</span>
                    </div>
                  </div>
                );
              })}
              {isUploading && (
                <div className="message-wrapper mine">
                  <div className="message-content">
                    <div className="message-bubble uploading-bubble">Sending media...</div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="main-input-area">
              {isRecording ? (
                <div className="recording-container">
                  <div className="recording-indicator">
                    <span className="pulse-dot"></span>
                    Recording {formatTime(recordingTime)}
                  </div>
                  <button onClick={stopRecording} className="stop-record-btn">
                    <Square size={16} fill="currentColor" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTextSubmit} className="chat-form">
                  <button type="button" className="chat-attach-btn" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                  />
                  
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="chat-input"
                  />
                  
                  {inputText.trim() ? (
                    <button type="submit" className="chat-send-btn">
                      <Send size={18} />
                    </button>
                  ) : (
                    <button type="button" className="chat-mic-btn" onMouseDown={startRecording}>
                      <Mic size={20} />
                    </button>
                  )}
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="main-empty">
            <User size={64} className="empty-icon" />
            <h3>Select a conversation</h3>
            <p>Choose a customer from the left to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
