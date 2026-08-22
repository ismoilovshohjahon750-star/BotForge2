import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, query, where, getDocs } from 'firebase/firestore';
import { safeAddDoc, safeSetDoc, safeDeleteDoc, safeUpdateDoc } from '../lib/safeFirestore';
import { 
  MessageSquare, Send, Plus, Search, Trash2, CheckCheck, Check,
  User, ShieldAlert, Clock, ArrowLeft, RefreshCw, X, Sparkles, MessageCircle,
  Paperclip, Smile, MoreVertical, Phone, Video, Info, Lock,
  File, FileText, FileCode, FileArchive, FileSpreadsheet, Film, Music, Download
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import feedbackAvatarImg from '../assets/images/feedback_avatar_1786443979118.jpg';

interface MessageReply {
  sender: 'admin' | 'user';
  text: string;
  createdAt: string;
  senderName?: string;
  senderId?: string;
  senderEmail?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileExtension?: string;
  fileSize?: string;
}

interface ContactMessage {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  targetUserId?: string;
  targetUserEmail?: string;
  targetUserName?: string;
  subject?: string;
  message: string;
  status?: string;
  createdAt: string;
  replies?: MessageReply[];
  unreadUser?: boolean;
  unreadAdmin?: boolean;
  unreadTarget?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileExtension?: string;
  fileSize?: string;
}

interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
  photoURL?: string;
}

interface SelectedAttachment {
  file: File;
  name: string;
  size: string;
  dataUrl: string;
  category: {
    type: 'image' | 'video' | 'audio' | 'pdf' | 'doc' | 'archive' | 'code' | 'file';
    extension: string;
  };
}

function getFileCategory(fileName: string, mimeType: string): {
  type: 'image' | 'video' | 'audio' | 'pdf' | 'doc' | 'archive' | 'code' | 'file';
  extension: string;
} {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return { type: 'image', extension: ext.toUpperCase() };
  }
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv'].includes(ext)) {
    return { type: 'video', extension: ext.toUpperCase() };
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext)) {
    return { type: 'audio', extension: ext.toUpperCase() };
  }
  if (ext === 'pdf' || mimeType.includes('pdf')) {
    return { type: 'pdf', extension: 'PDF' };
  }
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'csv'].includes(ext)) {
    return { type: 'doc', extension: ext.toUpperCase() };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { type: 'archive', extension: ext.toUpperCase() };
  }
  if (['html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'cpp', 'c', 'cs', 'java', 'json', 'php', 'rb', 'go', 'rs', 'sql', 'sh', 'xml', 'yaml', 'yml', 'md', 'kt', 'swift'].includes(ext)) {
    return { type: 'code', extension: ext.toUpperCase() };
  }
  return { type: 'file', extension: ext ? ext.toUpperCase() : 'FILE' };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export const Messages: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialChatId = searchParams.get('chatId');

  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [activeMsg, setActiveMsg] = useState<ContactMessage | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // File attachment state
  const [selectedFile, setSelectedFile] = useState<SelectedAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New chat modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedTargetUser, setSelectedTargetUser] = useState<UserProfile | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [creatingMsg, setCreatingMsg] = useState(false);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);

  // Mobile view state: 'list' or 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all user profiles for searching
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'profiles'), (snapshot) => {
      const profs = snapshot.docs.map(d => {
        const data = d.data();
        const email = data.email || '';
        const name = data.displayName || email.split('@')[0] || 'Foydalanuvchi';
        const photoURL = data.photoURL || (email ? `https://unavatar.io/${encodeURIComponent(email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2b5278&color=ffffff&bold=true` : '');
        return {
          id: d.id,
          email,
          displayName: name,
          username: data.username || email.split('@')[0] || '',
          photoURL
        };
      }).filter(p => p.id !== user.uid && p.email?.toLowerCase() !== user.email?.toLowerCase());
      setAllProfiles(profs);
    }, (err) => {
      console.warn("Profiles listen error:", err);
    });
    return () => unsub();
  }, [user]);

  // Fetch messages in real-time
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, 'contact_messages'), (snapshot) => {
      const allMsgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as ContactMessage));

      const filtered = allMsgs.filter(m => {
        if (isAdmin) return true;
        const myEmail = user.email?.toLowerCase();
        const myUid = user.uid;

        const isSender = m.userId === myUid || (m.userEmail && myEmail && m.userEmail.toLowerCase() === myEmail);
        const isTarget = (m.targetUserId && m.targetUserId === myUid) || (m.targetUserEmail && myEmail && m.targetUserEmail.toLowerCase() === myEmail);

        return isSender || isTarget;
      });

      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMessagesList(filtered);
    }, (err) => {
      console.warn("Contact messages listen error:", err);
    });

    return () => unsub();
  }, [user, isAdmin]);

  useEffect(() => {
    if (messagesList.length === 0) {
      setActiveMsg(null);
      return;
    }

    if (initialChatId) {
      const found = messagesList.find(m => m.id === initialChatId);
      if (found) {
        setActiveMsg(found);
        setMobileView('chat');
        return;
      }
    }

    if (activeMsg) {
      const updated = messagesList.find(m => m.id === activeMsg.id);
      if (updated) {
        setActiveMsg(updated);
        return;
      }
    }

    if (!activeMsg && messagesList.length > 0) {
      setActiveMsg(messagesList[0]);
    }
  }, [messagesList, initialChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMsg?.replies, activeMsg?.id]);

  useEffect(() => {
    if (!activeMsg || !user) return;
    const myEmail = user.email?.toLowerCase();
    const isSender = activeMsg.userId === user.uid || (activeMsg.userEmail && myEmail && activeMsg.userEmail.toLowerCase() === myEmail);

    if (!isAdmin) {
      if (isSender && activeMsg.unreadUser) {
        const msgRef = doc(db, 'contact_messages', activeMsg.id);
        safeUpdateDoc(msgRef, { unreadUser: false }).catch(console.error);
      } else if (!isSender && activeMsg.unreadTarget) {
        const msgRef = doc(db, 'contact_messages', activeMsg.id);
        safeUpdateDoc(msgRef, { unreadTarget: false }).catch(console.error);
      }
    } else if (isAdmin && activeMsg.unreadAdmin) {
      const msgRef = doc(db, 'contact_messages', activeMsg.id);
      safeUpdateDoc(msgRef, { unreadAdmin: false }).catch(console.error);
    }

    // Automatically mark all unread notifications for this active chat as read
    try {
      const qNotifs = query(
        collection(db, 'notifications'),
        where('chatId', '==', activeMsg.id),
        where('read', '==', false)
      );
      getDocs(qNotifs).then(snap => {
        snap.forEach(d => {
          const data = d.data();
          if (data.userEmail?.toLowerCase() === myEmail || data.userId === user.uid || (data.userId && data.userId.toLowerCase() === myEmail)) {
            safeUpdateDoc(doc(db, 'notifications', d.id), { read: true }).catch(() => {});
          }
        });
      }).catch(console.error);
    } catch (e) {
      console.warn("Auto-read notifications error:", e);
    }
  }, [activeMsg, user, isAdmin]);

  const getUserAvatarUrl = (email?: string, name?: string, photoURL?: string) => {
    if (photoURL) return photoURL;
    if (!email && !name) return undefined;
    const displayName = name || email?.split('@')[0] || 'User';
    if (email) {
      return `https://unavatar.io/${encodeURIComponent(email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2b5278&color=ffffff&bold=true`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2b5278&color=ffffff&bold=true`;
  };

  const getChatPartner = (m: ContactMessage) => {
    if (!user) return { name: 'Foydalanuvchi', email: '', photoURL: '', isSupport: false };
    const myUid = user.uid;
    const myEmail = user.email?.toLowerCase();

    const isSender = m.userId === myUid || (m.userEmail && myEmail && m.userEmail.toLowerCase() === myEmail);

    let name = '';
    let email = '';
    let isSupport = false;

    if (isSender) {
      if (m.targetUserName || m.targetUserEmail) {
        name = m.targetUserName || m.targetUserEmail?.split('@')[0] || 'Foydalanuvchi';
        email = m.targetUserEmail || '';
      } else {
        name = "Shikoyatlar va takliflar";
        email = 'admin@cloudbot.uz';
        isSupport = true;
      }
    } else {
      name = m.userName || m.userEmail?.split('@')[0] || 'Foydalanuvchi';
      email = m.userEmail || '';
    }

    if (email === 'admin@cloudbot.uz' || email === 'admin@botforge.uz' || name === 'Shikoyatlar va takliflar') {
      isSupport = true;
    }

    const prof = allProfiles.find(p => p.email?.toLowerCase() === email.toLowerCase());
    const photoURL = prof?.photoURL || getUserAvatarUrl(email, name);

    return {
      name,
      email,
      photoURL,
      isSupport
    };
  };

  const renderPartnerAvatar = (partner: { name: string; email: string; photoURL?: string; isSupport?: boolean }, sizeClass = "w-10 h-10") => {
    if (partner.isSupport || partner.email === 'admin@cloudbot.uz' || partner.email === 'admin@botforge.uz' || partner.name === 'Shikoyatlar va takliflar') {
      return (
        <img 
          src={feedbackAvatarImg} 
          alt="Shikoyatlar va takliflar" 
          className={`${sizeClass} rounded-full object-cover shrink-0 border border-amber-500/30 shadow-sm`} 
          referrerPolicy="no-referrer" 
        />
      );
    }

    const avatarUrl = partner.photoURL || getUserAvatarUrl(partner.email, partner.name);

    return (
      <img
        src={avatarUrl}
        alt={partner.name || 'User'}
        className={`${sizeClass} rounded-full object-cover shrink-0 border border-[#2b5278]/40 shadow-sm`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name || 'User')}&background=2b5278&color=ffffff&bold=true`;
        }}
      />
    );
  };

  const handleSelectChat = (msg: ContactMessage) => {
    setActiveMsg(msg);
    setSearchParams({ chatId: msg.id });
    setMobileView('chat');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit for Firestore document (850KB max)
    if (file.size > 850 * 1024) {
      toast.error("Fayl hajmi 850 KB dan oshmasligi kerak (Firestore cheklovi)");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const category = getFileCategory(file.name, file.type);
      setSelectedFile({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        dataUrl,
        category
      });
      toast.success(`${file.name} biriktirildi`);
    };
    reader.onerror = () => {
      toast.error("Faylni o'qishda xatolik yuz berdi");
    };
    reader.readAsDataURL(file);
  };

  const renderAttachment = (item: MessageReply | ContactMessage) => {
    if (!item.fileUrl) return null;

    const fileName = item.fileName || 'Fayl';
    const fileType = item.fileType || 'file';
    const fileExtension = item.fileExtension || 'FILE';
    const fileSize = item.fileSize || '';

    if (fileType === 'image') {
      return (
        <div className="my-1.5 overflow-hidden rounded-xl border border-white/10 bg-black/20 max-w-xs sm:max-w-sm">
          <img 
            src={item.fileUrl} 
            alt={fileName} 
            className="w-full max-h-72 object-contain rounded-t-xl cursor-pointer hover:opacity-90 transition-opacity bg-black/40"
            onClick={() => window.open(item.fileUrl, '_blank')}
          />
          <div className="p-2 flex items-center justify-between text-[11px] text-[#8696a7] bg-[#17212b]/90">
            <span className="truncate max-w-[180px] font-medium text-white">{fileName}</span>
            <a
              href={item.fileUrl}
              download={fileName}
              className="p-1 text-[#5288c1] hover:text-white transition-colors flex items-center gap-1 text-[10px]"
              title="Yuklab olish"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      );
    }

    if (fileType === 'video') {
      return (
        <div className="my-1.5 overflow-hidden rounded-xl border border-white/10 bg-black/30 max-w-xs sm:max-w-sm">
          <video src={item.fileUrl} controls className="w-full max-h-64 rounded-t-xl bg-black" />
          <div className="p-2 flex items-center justify-between text-[11px] text-[#8696a7] bg-[#17212b]">
            <span className="truncate font-medium text-white">{fileName}</span>
            <a
              href={item.fileUrl}
              download={fileName}
              className="p-1 text-[#5288c1] hover:text-white transition-colors"
              title="Yuklab olish"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      );
    }

    if (fileType === 'audio') {
      return (
        <div className="my-1.5 p-2 rounded-xl border border-white/10 bg-[#17212b]/90 max-w-xs sm:max-w-sm">
          <div className="flex items-center gap-2 mb-1 text-[11px] font-medium text-white truncate">
            <Music className="w-4 h-4 text-[#5288c1] shrink-0" />
            <span className="truncate">{fileName}</span>
          </div>
          <audio src={item.fileUrl} controls className="w-full h-8" />
        </div>
      );
    }

    let IconComp = File;
    let iconBg = "bg-[#2b5278]/40 text-[#5288c1]";

    if (fileType === 'code') {
      IconComp = FileCode;
      iconBg = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    } else if (fileType === 'pdf') {
      IconComp = FileText;
      iconBg = "bg-rose-500/20 text-rose-400 border border-rose-500/30";
    } else if (fileType === 'doc') {
      IconComp = FileSpreadsheet;
      iconBg = "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    } else if (fileType === 'archive') {
      IconComp = FileArchive;
      iconBg = "bg-purple-500/20 text-purple-400 border border-purple-500/30";
    }

    return (
      <div className="my-1.5 p-2.5 rounded-xl border border-white/10 bg-[#17212b]/90 flex items-center justify-between gap-3 max-w-xs sm:max-w-sm shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0 font-bold`}>
            <IconComp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{fileName}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-[#8696a7] mt-0.5">
              <span className="font-mono uppercase bg-white/10 px-1 rounded text-sky-200">{fileExtension}</span>
              {fileSize && <span>{fileSize}</span>}
            </div>
          </div>
        </div>
        <a
          href={item.fileUrl}
          download={fileName}
          className="p-2 bg-[#2b5278]/60 hover:bg-[#2b5278] text-white rounded-lg transition-colors shrink-0 flex items-center gap-1 text-[10px]"
          title="Yuklab olish"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    );
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!replyText.trim() && !selectedFile) || !activeMsg || !user) return;

    setSending(true);
    try {
      const msgRef = doc(doc(db, 'contact_messages', activeMsg.id).firestore, 'contact_messages', activeMsg.id);
      const existingReplies = activeMsg.replies || [];
      const newReply: MessageReply = {
        sender: isAdmin ? 'admin' : 'user',
        senderId: user.uid,
        senderEmail: user.email || '',
        text: replyText.trim(),
        createdAt: new Date().toISOString(),
        senderName: user.displayName || user.email?.split('@')[0] || (isAdmin ? 'Admin' : 'Foydalanuvchi'),
        ...(selectedFile ? {
          fileUrl: selectedFile.dataUrl,
          fileName: selectedFile.name,
          fileType: selectedFile.category.type,
          fileExtension: selectedFile.category.extension,
          fileSize: selectedFile.size
        } : {})
      };

      const myEmail = user.email?.toLowerCase();
      const isSender = activeMsg.userId === user.uid || (activeMsg.userEmail && myEmail && activeMsg.userEmail.toLowerCase() === myEmail);

      const updateData: any = {
        replies: [...existingReplies, newReply],
        updatedAt: new Date().toISOString()
      };

      if (isAdmin) {
        updateData.unreadUser = true;
        updateData.unreadTarget = true;
      } else if (isSender) {
        updateData.unreadTarget = true;
        updateData.unreadAdmin = true;
      } else {
        updateData.unreadUser = true;
      }

      await safeSetDoc(msgRef, updateData, { merge: true });

      const partner = getChatPartner(activeMsg);
      if (partner.email && partner.email.toLowerCase() !== user.email?.toLowerCase() && partner.email !== 'admin@cloudbot.uz' && partner.email !== 'admin@botforge.uz') {
        try {
          const notificationMsg = selectedFile 
            ? `📎 ${selectedFile.name}${replyText.trim() ? ': ' + replyText.trim() : ''}`
            : replyText.trim();
          await safeAddDoc(collection(db, 'notifications'), {
            userId: partner.email.toLowerCase(),
            userEmail: partner.email.toLowerCase(),
            senderEmail: user.email?.toLowerCase() || '',
            senderName: user.displayName || user.email?.split('@')[0] || (isAdmin ? 'Admin' : 'Foydalanuvchi'),
            title: "Yangi xabar",
            message: `${user.displayName || user.email?.split('@')[0] || (isAdmin ? 'Admin' : 'Foydalanuvchi')}: ${notificationMsg.substring(0, 50)}...`,
            type: 'chat_message',
            chatId: activeMsg.id,
            read: false,
            createdAt: new Date().toISOString()
          });
        } catch (nErr) {
          console.warn("Notification send error:", nErr);
        }
      }

      setReplyText('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error("Reply error:", err);
      toast.error("Xabar yuborishda xatolik: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCreateNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreatingMsg(true);
    try {
      let targetId = '';
      let targetEmail = '';
      let targetName = '';

      if (selectedTargetUser) {
        targetId = selectedTargetUser.id;
        targetEmail = selectedTargetUser.email;
        targetName = selectedTargetUser.displayName || selectedTargetUser.username || selectedTargetUser.email;
      } else if (userSearchQuery.trim()) {
        targetEmail = userSearchQuery.trim();
        targetName = userSearchQuery.trim().split('@')[0];
      } else {
        toast.error("Iltimos, foydalanuvchini tanlang");
        setCreatingMsg(false);
        return;
      }

      if (targetEmail.toLowerCase() === user.email?.toLowerCase()) {
        toast.error("O'zingizga chat taklifini yubora olmaysiz");
        setCreatingMsg(false);
        return;
      }

      // Check if active chat with this user already exists
      const existingChat = messagesList.find(m => {
        const partner = getChatPartner(m);
        return partner.email?.toLowerCase() === targetEmail.toLowerCase();
      });

      if (existingChat) {
        toast.info("Ushbu foydalanuvchi bilan allaqachon muloqotingiz mavjud!");
        setActiveMsg(existingChat);
        setSearchParams({ chatId: existingChat.id });
        setIsNewModalOpen(false);
        setUserSearchQuery('');
        setSelectedTargetUser(null);
        setCreatingMsg(false);
        return;
      }


      // Send chat invite notification to target user
      await safeAddDoc(collection(db, 'notifications'), {
        userId: targetEmail.toLowerCase(),
        userEmail: targetEmail.toLowerCase(),
        senderEmail: user.email || '',
        senderName: user.displayName || user.email?.split('@')[0] || 'Foydalanuvchi',
        title: "Chat taklifi",
        message: `${user.displayName || user.email?.split('@')[0] || 'Foydalanuvchi'} (${user.email || ''}) sizga chat taklifini yubordi.`,
        type: 'chat_invite',
        status: 'pending',
        read: false,
        createdAt: new Date().toISOString()
      });

      toast.success("Chat taklifi muvaffaqiyatli yuborildi!");
      setIsNewModalOpen(false);
      setUserSearchQuery('');
      setSelectedTargetUser(null);
    } catch (err: any) {
      console.error("Create invite error:", err);
      toast.error("Chat taklifini yuborishda xatolik: " + err.message);
    } finally {
      setCreatingMsg(false);
    }
  };

  const triggerDeleteSingle = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDeleteSingle = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);

    try {
      setMessagesList(prev => prev.filter(m => m.id !== id));
      if (activeMsg?.id === id) {
        setActiveMsg(null);
        setMobileView('list');
      }
      await safeDeleteDoc(doc(db, 'contact_messages', id));
      toast.success("Suhbat o'chirildi");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error("O'chirishda xatolik: " + err.message);
    }
  };

  const confirmDeleteAll = async () => {
    setShowDeleteAllModal(false);
    if (messagesList.length === 0) return;

    try {
      const toDelete = [...messagesList];
      setMessagesList([]);
      setActiveMsg(null);
      setMobileView('list');
      toast.success("Barcha suhbatlar o'chirildi");

      for (const m of toDelete) {
        await safeDeleteDoc(doc(db, 'contact_messages', m.id));
      }
    } catch (err: any) {
      console.error("Delete all error:", err);
      toast.error("O'chirishda xatolik: " + err.message);
    }
  };

  const filteredList = messagesList.filter(m => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.subject && m.subject.toLowerCase().includes(term)) ||
      (m.message && m.message.toLowerCase().includes(term)) ||
      (m.userEmail && m.userEmail.toLowerCase().includes(term)) ||
      (m.userName && m.userName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#0e1621] text-white overflow-hidden relative font-sans">
      
      {/* Telegram Left Sidebar - Chat List */}
      <div className={`w-full md:w-[340px] lg:w-[380px] bg-[#17212b] border-r border-[#0e1621] flex flex-col h-full z-10 ${
        mobileView === 'chat' ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Sidebar Header / Search */}
        <div className="p-3 bg-[#17212b] border-b border-[#0e1621] flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2b5278] text-white flex items-center justify-center font-bold shadow-inner">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base tracking-wide leading-tight">CloudBot Chat</h1>
                <p className="text-[11px] text-[#8696a7]">{messagesList.length} ta faol suhbat</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {messagesList.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllModal(true)}
                  className="p-2 text-[#8696a7] hover:text-red-400 hover:bg-[#202b38] rounded-full transition-colors"
                  title="Barchasini tozalash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="p-2 text-[#8696a7] hover:text-white hover:bg-[#202b38] rounded-full transition-colors"
                title="Yangi xabar"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mt-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8696a7]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Qidirish..."
              className="w-full bg-[#242f3d] text-white placeholder-[#8696a7] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#2b5278]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8696a7] hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chat List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#0e1621]/40">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageCircle className="w-12 h-12 text-[#8696a7]/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">Xabarlar topilmadi</p>
              <p className="text-xs text-[#8696a7] mb-5">
                {searchTerm ? 'Qidiruv bo‘yicha hech narsa topilmadi' : 'Telegram uslubidagi suhbatni boshlang'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="px-4 py-2 bg-[#2b5278] hover:bg-[#386794] text-white text-xs font-semibold rounded-xl shadow transition-all"
                >
                  Yangi chat ochish
                </button>
              )}
            </div>
          ) : (
            filteredList.map((m) => {
              const isSelected = activeMsg?.id === m.id;
              const partner = getChatPartner(m);
              const isSender = m.userId === user?.uid || (m.userEmail && user?.email && m.userEmail.toLowerCase() === user.email.toLowerCase());
              const hasUnread = isAdmin ? m.unreadAdmin : (isSender ? m.unreadUser : m.unreadTarget);

              const rawLastText = m.replies && m.replies.length > 0 
                ? m.replies[m.replies.length - 1].text 
                : m.message;
              const displayLastText = (rawLastText === 'Chat taklifi qabul qilindi. Muloqotni boshlashingiz mumkin!' || !rawLastText || !rawLastText.trim())
                ? "Hozircha xabarlar yo'q"
                : rawLastText;
              const lastTime = m.replies && m.replies.length > 0
                ? m.replies[m.replies.length - 1].createdAt
                : m.createdAt;

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectChat(m)}
                  className={`px-3 py-2.5 cursor-pointer transition-colors relative flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-[#2b5278]/40 border-l-4 border-[#5288c1]' 
                      : 'hover:bg-[#202b38]'
                  }`}
                >
                  <div className="relative shrink-0">
                    {renderPartnerAvatar(partner, "w-12 h-12")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-white truncate">
                        {partner.name}
                      </h4>
                      <span className="text-[10px] text-[#8696a7] shrink-0 font-medium">
                        {new Date(lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-[#8696a7] truncate mb-1">
                      {m.subject && <span className="text-[#e2e8f0] font-medium mr-1">[{m.subject}]</span>}
                      {displayLastText}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#8696a7]">
                      <span className="truncate">{partner.email}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasUnread ? (
                          <span className="w-5 h-5 rounded-full bg-[#5288c1] text-[#0e1621] font-bold flex items-center justify-center text-[10px]">
                            1
                          </span>
                        ) : (
                          <CheckCheck className="w-3.5 h-3.5 text-[#5288c1]" />
                        )}
                        <button
                          onClick={(e) => triggerDeleteSingle(m.id, e)}
                          title="Suhbatni o'chirish"
                          className="p-1 hover:text-red-400 text-[#8696a7]/60 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Telegram Right Chat Area */}
      <div className={`flex-1 flex flex-col h-full bg-[#0e1621] relative ${
        mobileView === 'list' ? 'hidden md:flex' : 'flex'
      }`}>
        {activeMsg ? (
          <>
            {/* Telegram Chat Header */}
            <div className="px-4 py-3 bg-[#17212b] border-b border-[#0e1621] flex items-center justify-between gap-3 shrink-0 z-10 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 rounded-full hover:bg-[#202b38] text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {(() => {
                  const partner = getChatPartner(activeMsg);
                  return (
                    <>
                      {renderPartnerAvatar(partner, "w-10 h-10")}
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-white truncate">
                          {partner.name}
                        </h3>
                        <p className="text-[11px] text-[#8696a7] truncate">
                          <span>online</span> • <span className="text-[#5288c1]">{partner.email || activeMsg.subject || 'Telegram chat'}</span>
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => toast.info("Telegram ovozli qo'ng'iroq simulyatsiyasi")}
                  className="p-2.5 rounded-full hover:bg-[#202b38] text-[#8696a7] hover:text-white transition-colors" 
                  title="Qo'ng'iroq"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => triggerDeleteSingle(activeMsg.id)}
                  className="p-2.5 rounded-full hover:bg-[#202b38] text-[#8696a7] hover:text-red-400 transition-colors" 
                  title="Suhbatni o'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Telegram Chat Background & Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px] bg-[#0e1621]">
              


              {/* Initial Message Bubble (if non-empty) */}
              {activeMsg.message && activeMsg.message.trim() !== '' && activeMsg.message !== 'Chat taklifi qabul qilindi. Muloqotni boshlashingiz mumkin!' && (() => {
                const partner = getChatPartner(activeMsg);
                const myEmail = user?.email?.toLowerCase();
                const isInitialMsgFromMe = activeMsg.userId === user?.uid || (activeMsg.userEmail && myEmail && activeMsg.userEmail.toLowerCase() === myEmail);

                return (
                  <div className={`flex flex-col max-w-[80%] md:max-w-[65%] ${isInitialMsgFromMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <div className={`relative px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                      isInitialMsgFromMe 
                        ? 'bg-[#2b5278] text-white rounded-br-sm' 
                        : 'bg-[#182533] text-white rounded-bl-sm border border-white/5'
                    }`}>
                      <div className="text-[10px] font-semibold mb-0.5 text-[#8696a7] flex items-center justify-between gap-3">
                        <span className={isInitialMsgFromMe ? 'text-[#85b5e5]' : 'text-[#e2e8f0]'}>
                          {isInitialMsgFromMe ? (user?.displayName || 'Siz') : (activeMsg.userName || partner.name)}
                        </span>
                      </div>
                      {activeMsg.message && <p className="whitespace-pre-wrap pr-12">{activeMsg.message}</p>}
                      {renderAttachment(activeMsg)}
                      
                      <div className="absolute right-2.5 bottom-1.5 flex items-center gap-1 text-[9px] text-[#8696a7]">
                        <span>{new Date(activeMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isInitialMsgFromMe && <CheckCheck className="w-3.5 h-3.5 text-[#5288c1]" />}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Empty Chat State Placeholder */}
              {(!activeMsg.message || !activeMsg.message.trim() || activeMsg.message === 'Chat taklifi qabul qilindi. Muloqotni boshlashingiz mumkin!') && (!activeMsg.replies || activeMsg.replies.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 select-none my-auto">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                    <Send className="w-9 h-9 text-[#2b5278] ml-1" />
                  </div>
                  <h3 className="text-white text-base sm:text-lg font-bold mb-1">
                    Hozircha xabarlar yo'q
                  </h3>
                  <p className="text-[#8696a7] text-xs sm:text-sm max-w-xs">
                    Birinchi bo'lib ushbu chatda xabar qoldiring!
                  </p>
                </div>
              )}

              {/* Replies Bubbles */}
              {activeMsg.replies && activeMsg.replies.map((r, idx) => {
                const partner = getChatPartner(activeMsg);
                const myEmail = user?.email?.toLowerCase();
                const isInitialMsgFromMe = activeMsg.userId === user?.uid || (activeMsg.userEmail && myEmail && activeMsg.userEmail.toLowerCase() === myEmail);

                const isMe = (() => {
                  if (!user) return false;
                  if (r.senderEmail && user.email && r.senderEmail.toLowerCase() === user.email.toLowerCase()) return true;
                  if (r.senderId && r.senderId === user.uid) return true;
                  if (isAdmin) return r.sender === 'admin';

                  if (isInitialMsgFromMe) {
                    return r.sender === 'user';
                  } else {
                    return r.sender === 'user' && r.senderName !== activeMsg.userName;
                  }
                })();

                return (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[80%] md:max-w-[65%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className={`relative px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                      isMe 
                        ? 'bg-[#2b5278] text-white rounded-br-sm' 
                        : 'bg-[#182533] text-white rounded-bl-sm border border-white/5'
                    }`}>
                      <div className="text-[10px] font-semibold mb-0.5 text-[#8696a7] flex items-center gap-1">
                        {r.sender === 'admin' ? (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Shikoyatlar va takliflar
                          </span>
                        ) : (
                          <span className={isMe ? 'text-[#85b5e5]' : 'text-[#e2e8f0]'}>
                            {isMe ? (user?.displayName || 'Siz') : (r.senderName || partner.name)}
                          </span>
                        )}
                      </div>
                      {r.text && <p className="whitespace-pre-wrap pr-12">{r.text}</p>}
                      {renderAttachment(r)}

                      <div className="absolute right-2.5 bottom-1.5 flex items-center gap-1 text-[9px] text-[#8696a7]">
                        <span>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#5288c1]" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Telegram Chat Input Bar */}
            <div className="p-3 bg-[#17212b] border-t border-[#0e1621] shrink-0">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="*" 
              />

              {/* Selected File Attachment Preview */}
              {selectedFile && (
                <div className="flex items-center justify-between bg-[#202b38] border border-[#2b5278] rounded-xl px-3 py-2 mb-2 text-xs text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 max-w-4xl mx-auto">
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <Paperclip className="w-4 h-4 text-[#5288c1] shrink-0" />
                    <span className="font-medium truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-[#8696a7] shrink-0">({selectedFile.size})</span>
                    <span className="bg-[#2b5278] text-[9px] px-1.5 py-0.5 rounded font-mono uppercase text-sky-200 shrink-0">
                      {selectedFile.category.extension}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[#8696a7] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
                    title="O'chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendReply} className="flex items-center gap-2 max-w-4xl mx-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-[#8696a7] hover:text-white rounded-full hover:bg-[#202b38] transition-colors shrink-0 cursor-pointer"
                  title="Fayl biriktirish (Video, Audio, PDF, Rasm, Doc, ZIP, Code va h.k.)"
                >
                  <Paperclip className="w-5 h-5 text-[#8696a7] hover:text-sky-400" />
                </button>

                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Xabar yozing..."
                  disabled={sending}
                  className="flex-1 bg-[#242f3d] text-white placeholder-[#8696a7] text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#2b5278]"
                />

                <button
                  type="button"
                  onClick={() => toast.info("Emoji paneli")}
                  className="p-2.5 text-[#8696a7] hover:text-white rounded-full hover:bg-[#202b38] transition-colors shrink-0 hidden sm:block"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <button
                  type="submit"
                  disabled={sending || (!replyText.trim() && !selectedFile)}
                  className="p-3 bg-[#2b5278] hover:bg-[#386794] text-white rounded-xl transition-all shadow shrink-0 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  title="Yuborish"
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0e1621]">
            <div className="w-20 h-20 rounded-full bg-[#17212b] text-[#5288c1] flex items-center justify-center mb-4 shadow-lg border border-white/5">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Suhbat tanlanmagan</h3>
            <p className="text-xs text-[#8696a7] max-w-sm mb-6">
              Muloqotni boshlash uchun chapdagi ro‘yxatdan suhbatni tanlang yoki yangi chat oching.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-5 py-2.5 bg-[#2b5278] hover:bg-[#386794] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Yangi chat boshlash
            </button>
          </div>
        )}
      </div>

      {/* NEW CHAT MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#17212b] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col max-h-[90vh] text-white">
            <button
              onClick={() => {
                setIsNewModalOpen(false);
                setSelectedTargetUser(null);
                setUserSearchQuery('');
              }}
              className="absolute right-4 top-4 text-[#8696a7] hover:text-white p-1 rounded-full hover:bg-[#202b38] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#2b5278] text-white flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Yangi Chat Boshlash</h3>
                <p className="text-xs text-[#8696a7]">Foydalanuvchi bilan muloqot</p>
              </div>
            </div>

            <form onSubmit={handleCreateNewMessage} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-[#8696a7] mb-1.5">
                  Foydalanuvchini Qidirish (Username yoki Email)
                </label>

                  {selectedTargetUser ? (
                    <div className="flex items-center justify-between p-3 bg-[#2b5278]/30 border border-[#2b5278] rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={getUserAvatarUrl(selectedTargetUser.email, selectedTargetUser.displayName, selectedTargetUser.photoURL)} 
                          alt={selectedTargetUser.displayName || 'User'} 
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{selectedTargetUser.displayName}</p>
                          <p className="text-[11px] text-[#8696a7] truncate">{selectedTargetUser.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedTargetUser(null)}
                        className="p-1 text-[#8696a7] hover:text-white rounded-lg hover:bg-black/20 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8696a7]" />
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          placeholder="Masalan: @shohjahon yoki email..."
                          className="w-full bg-[#0e1621] text-white placeholder-[#8696a7] border border-white/5 rounded-xl pl-10 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#2b5278]"
                        />
                      </div>

                      <div className="max-h-44 overflow-y-auto border border-white/5 rounded-xl divide-y divide-[#0e1621] bg-[#0e1621]/60 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {(() => {
                          const searchResults = allProfiles.filter(p => {
                            if (!userSearchQuery.trim()) return true;
                            const q = userSearchQuery.toLowerCase().trim().replace(/^@/, '');
                            return (
                              p.displayName?.toLowerCase().includes(q) ||
                              p.username?.toLowerCase().includes(q) ||
                              p.email?.toLowerCase().includes(q)
                            );
                          });

                          if (searchResults.length === 0) {
                            return (
                              <div className="p-4 text-center">
                                <p className="text-xs text-[#8696a7] mb-2">Foydalanuvchi topilmadi</p>
                                {userSearchQuery.trim() && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTargetUser({
                                        id: '',
                                        email: userSearchQuery.trim(),
                                        displayName: userSearchQuery.trim().split('@')[0],
                                        username: userSearchQuery.trim().split('@')[0]
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-[#2b5278] hover:bg-[#386794] text-white rounded-lg text-xs font-medium transition"
                                  >
                                    "{userSearchQuery.trim()}" ga xabar yuborish
                                  </button>
                                )}
                              </div>
                            );
                          }

                          return searchResults.slice(0, 5).map((p) => (
                            <div
                              key={p.id}
                              onClick={() => setSelectedTargetUser(p)}
                              className="p-2.5 hover:bg-[#202b38] cursor-pointer flex items-center justify-between transition-colors text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img 
                                  src={getUserAvatarUrl(p.email, p.displayName, p.photoURL)} 
                                  alt={p.displayName || 'User'} 
                                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate">{p.displayName}</p>
                                  <p className="text-[10px] text-[#8696a7] truncate">{p.email}</p>
                                  </div>
                              </div>
                              <span className="text-[10px] text-[#5288c1] font-medium bg-[#2b5278]/20 px-2 py-0.5 rounded-md">Tanlash</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>





              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#8696a7] hover:text-white rounded-xl hover:bg-[#202b38] transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={creatingMsg || (!selectedTargetUser && !userSearchQuery.trim())}
                  className="px-5 py-2.5 bg-[#2b5278] hover:bg-[#386794] text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-50"
                >
                  {creatingMsg ? 'Yuborilmoqda...' : 'Yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Single Chat */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#17212b] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center text-white">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Suhbatni o'chirish</h3>
            <p className="text-xs text-[#8696a7] mb-6">
              Haqiqatan ham ushbu suhbatni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-[#202b38] hover:bg-[#242f3d] text-xs font-semibold rounded-xl text-white transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={confirmDeleteSingle}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-xs font-bold rounded-xl text-white transition-colors shadow"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#17212b] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center text-white">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Barcha suhbatlarni tozalash</h3>
            <p className="text-xs text-[#8696a7] mb-6">
              Barcha chatlar va xabarlar o'chib ketadi. Davom etishni tasdiqlaysizmi?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 py-2.5 bg-[#202b38] hover:bg-[#242f3d] text-xs font-semibold rounded-xl text-white transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={confirmDeleteAll}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-xs font-bold rounded-xl text-white transition-colors shadow"
              >
                Barchasini o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
