import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { 
  MessageCircle, X, Send, Paperclip, Mic, Square, 
  Image as ImageIcon, Video, Play 
} from 'lucide-react';
import { format } from 'date-fns';
import { chatApi } from '../../api/chatApi';
import toast from 'react-hot-toast';
import './Chat.css';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CustomerChatWidget() {
  const { isAuthenticated, user, accessToken } = useSelector((s) => s.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Initialize socket (only once when auth is available)
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const newSocket = io(SOCKET_URL, {
        auth: { token: accessToken },
      });
      newSocket.on('connect', () => console.log('Chat connected'));
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [isAuthenticated, accessToken]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        // Prevent duplicate messages if already exists
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });

      const senderId = message.sender?._id || message.sender;
      if (!isOpenRef.current && senderId !== user._id) {
        setUnreadCount((c) => c + 1);
        toast.custom((t) => (
          <div className={`chat-toast ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
            <div className="chat-toast-avatar">{message.sender?.name?.[0] || 'S'}</div>
            <div className="chat-toast-content">
              <strong>{message.sender?.name || 'Support'} (Support)</strong>
              <p>{message.text || `Sent a ${message.mediaType}`}</p>
            </div>
          </div>
        ));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [socket, user]);

  // Fetch history when opened
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      setUnreadCount(0);
      chatApi.getHistory(user._id).then(res => {
        setMessages(res.data.messages);
        setTimeout(scrollToBottom, 100);
      }).catch(console.error);
    }
  }, [isOpen, isAuthenticated, user]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text = '', mediaUrl = '', mediaType = 'none') => {
    if ((!text.trim() && !mediaUrl) || !socket) return;
    
    socket.emit('send_message', {
      text,
      mediaUrl,
      mediaType,
      customerId: user._id, // we are the customer
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

    // Validate type roughly
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      return toast.error('Only images, videos, and audio are allowed');
    }

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

  // --- Voice Recording Logic ---
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
          setAudioChunks([]);
          setRecordingTime(0);
        }
        
        // Cleanup tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Timer
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

  if (!isAuthenticated) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-widget-container"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-status-dot"></div>
                <div>
                  <h4>Customer Support</h4>
                  <span>Typically replies in a few minutes</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="chat-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <MessageCircle size={40} className="empty-icon" />
                  <p>Send a message to start chatting with us.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={msg._id || i} className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                      {!isMine && <div className="message-avatar">{msg.sender?.name?.[0] || 'S'}</div>}
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
                })
              )}
              {isUploading && (
                <div className="message-wrapper mine">
                  <div className="message-content">
                    <div className="message-bubble uploading-bubble">Sending media...</div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
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
                    placeholder="Type a message..."
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
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className="chat-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && !isOpen && (
          <span className="chat-fab-badge">{unreadCount}</span>
        )}
      </motion.button>
    </>
  );
}
