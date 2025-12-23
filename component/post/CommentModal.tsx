import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { getRelativeTimeFromISO } from "@/utils/date";
import { AlertCircle, CheckCircle2, MoreHorizontal, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  comments: any[];
  postId: string;
  onSendComment: (content: string, parentId: string | null) => Promise<void>;
  onLikeComment: (commentId: string, liked: boolean) => Promise<void>;
  onRefresh: () => void;
}

export const CommentModal = ({
  visible,
  onClose,
  comments,
  onSendComment,
  onLikeComment,
  onRefresh,
}: CommentModalProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string; content: string } | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  
  // Menu & Alert States
  const [menuVisible, setMenuVisible] = useState<{ visible: boolean; commentId: string; content: string } | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ 
    visible: boolean; 
    type: "success" | "warning"; 
    message: string; 
    onConfirm?: () => void 
  }>({ visible: false, type: "success", message: "" });

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    AuthHelper.getInstance().getUserId().then(setCurrentUserId);

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /* ================= HANDLERS ================= */

  const handleSend = async () => {
    if (!newComment.trim()) return;
    
    try {
      if (editingComment) {
        const api = Api.getInstance();
        const token = await AuthHelper.getInstance().getAccessToken();
        const res = await fetch(`${api.baseUrl}/comments/${editingComment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: newComment }),
        });
        if (res.ok) {
          setEditingComment(null);
          onRefresh();
        }
      } else {
        await onSendComment(newComment, replyTo?.id || null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setNewComment("");
      setReplyTo(null);
      Keyboard.dismiss();
    }
  };

  const confirmDelete = (id: string) => {
    setMenuVisible(null);
    setAlertConfig({
      visible: true,
      type: "warning",
      message: "Bạn có chắc chắn muốn xóa bình luận này không?",
      onConfirm: async () => {
        try {
          const api = Api.getInstance();
          const token = await AuthHelper.getInstance().getAccessToken();
          const res = await fetch(`${api.baseUrl}/comments/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) onRefresh();
        } catch (e) { console.error(e); }
      }
    });
  };

  const renderCommentItem = ({ item }: any) => {
    const isOwner = item.authorId === currentUserId;
    const authorName = item.author?.name || "Người dùng";

    return (
      <View style={styles.commentBlock}>
        <View style={styles.commentRow}>
          <Image source={{ uri: item.author.avatarUrl || `https://ui-avatars.com/api/?name=${authorName}` }} style={styles.avatar} />
          <View style={styles.bubbleWrapper}>
            <View style={styles.bubble}>
              <Text style={styles.authorName}>{authorName}</Text>
              <Text style={styles.commentText}>{item.content}</Text>
            </View>
            <View style={styles.commentActions}>
              <TouchableOpacity onPress={() => onLikeComment(item.id, item.liked)}>
                <Text style={[styles.actionBtn, item.liked && styles.likedText]}>{item.liked ? "❤️" : "Thích"} {item.likeCount > 0 ? item.likeCount : ""}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setEditingComment(null);
                setReplyTo({ id: item.id, name: authorName, content: item.content });
                inputRef.current?.focus();
              }}>
                <Text style={styles.actionBtn}>Trả lời</Text>
              </TouchableOpacity>
              <Text style={styles.commentTime}>{getRelativeTimeFromISO(item.createdAt)}</Text>
              {isOwner && (
                <TouchableOpacity onPress={() => setMenuVisible({ visible: true, commentId: item.id, content: item.content })}>
                  <MoreHorizontal size={16} color="#65676b" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {item.replies?.map((reply: any) => (
          <View key={reply.id} style={[styles.commentRow, styles.replyRow]}>
            <Image source={{ uri: reply.author.avatarUrl || `https://ui-avatars.com/api/?name=${reply.author.name}` }} style={styles.replyAvatar} />
            <View style={styles.bubbleWrapper}>
              <View style={styles.bubble}>
                <Text style={styles.authorName}>{reply.author.name}</Text>
                <Text style={styles.commentText}><Text style={styles.highlightText}>@{authorName} </Text>{reply.content}</Text>
              </View>
              <View style={styles.commentActions}>
                <TouchableOpacity onPress={() => onLikeComment(reply.id, reply.liked)}>
                   <Text style={[styles.actionBtn, reply.liked && styles.likedText]}>{reply.liked ? "❤️" : "Thích"}</Text>
                </TouchableOpacity>
                {reply.authorId === currentUserId && (
                  <TouchableOpacity onPress={() => setMenuVisible({ visible: true, commentId: reply.id, content: reply.content })}>
                    <MoreHorizontal size={16} color="#65676b" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.flex1} onPress={onClose} />
        <View style={[styles.modalContainer, { height: SCREEN_HEIGHT * 0.85, paddingBottom: Platform.OS === 'ios' ? keyboardHeight : 0 }]}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>Bình luận</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}><X size={22} color="#666" /></TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputSection}>
            {(replyTo || editingComment) && (
              <View style={styles.replyPreviewContainer}>
                <View style={styles.replyPreviewContent}>
                  <Text style={styles.replyPreviewTitle}>{editingComment ? "Đang sửa bình luận" : `Đang trả lời ${replyTo?.name}`}</Text>
                  <Text style={styles.replyPreviewText} numberOfLines={1}>{editingComment ? editingComment.content : replyTo?.content}</Text>
                </View>
                <TouchableOpacity onPress={() => { setReplyTo(null); setEditingComment(null); setNewComment(""); }}>
                  <X size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput ref={inputRef} style={styles.textInput} placeholder="Viết bình luận..." value={newComment} onChangeText={setNewComment} multiline />
              <TouchableOpacity onPress={handleSend} disabled={!newComment.trim()}>
                <Text style={[styles.sendBtn, !newComment.trim() && { color: "#ccc" }]}>{editingComment ? "Lưu" : "Gửi"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* MENU ACTION SHEET */}
      <Modal visible={!!menuVisible} transparent animationType="fade">
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(null)}>
          <View style={styles.menuContent}>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setEditingComment({ id: menuVisible!.commentId, content: menuVisible!.content });
              setNewComment(menuVisible!.content);
              setMenuVisible(null);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}>
              <Text style={styles.menuText}>Chỉnh sửa bình luận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.borderTop]} onPress={() => confirmDelete(menuVisible!.commentId)}>
              <Text style={[styles.menuText, { color: '#FF3B30' }]}>Xóa bình luận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuCancel} onPress={() => setMenuVisible(null)}>
              <Text style={[styles.menuText, { fontWeight: '700', color: '#1c1e21' }]}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* CUSTOM ALERT XÁC NHẬN */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconCircle, { backgroundColor: alertConfig.type === 'warning' ? '#FFFBEB' : '#ECFDF5' }]}>
              {alertConfig.type === 'warning' ? <AlertCircle size={32} color="#F59E0B" /> : <CheckCircle2 size={32} color="#10B981" />}
            </View>
            <Text style={styles.alertTitle}>Xác nhận</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <View style={styles.alertActionRow}>
              <TouchableOpacity style={[styles.alertBtnBase, styles.btnCancelAlert]} onPress={() => setAlertConfig({ ...alertConfig, visible: false })}>
                <Text style={styles.btnTextCancelAlert}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.alertBtnBase, styles.btnConfirmAlert]} onPress={() => {
                setAlertConfig({ ...alertConfig, visible: false });
                alertConfig.onConfirm?.();
              }}>
                <Text style={styles.alertBtnTextAlert}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  flex1: { flex: 1 },
  modalContainer: { backgroundColor: "#fff", borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: "hidden" },
  header: { alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  handle: { width: 40, height: 4, backgroundColor: "#ddd", borderRadius: 2, marginBottom: 8 },
  title: { fontWeight: "700", fontSize: 16, color: "#1c1e21" },
  closeBtn: { position: "absolute", right: 16, top: 15 },
  listContent: { padding: 16, paddingBottom: 100 },
  commentBlock: { marginBottom: 20 },
  commentRow: { flexDirection: "row", gap: 10 },
  replyRow: { marginLeft: 44, marginTop: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#eee" },
  replyAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#eee" },
  bubbleWrapper: { flex: 1 },
  bubble: { backgroundColor: "#f0f2f5", padding: 12, borderRadius: 18, alignSelf: "flex-start", maxWidth: "95%" },
  authorName: { fontWeight: "700", fontSize: 13, color: "#1c1e21", marginBottom: 2 },
  commentText: { fontSize: 14, color: "#050505", lineHeight: 20 },
  highlightText: { color: "#007AFF", fontWeight: "700" },
  commentActions: { flexDirection: "row", gap: 16, marginTop: 6, alignItems: "center", paddingLeft: 4 },
  actionBtn: { fontSize: 12, color: "#65676b", fontWeight: "700" },
  likedText: { color: "#e53935" },
  commentTime: { fontSize: 12, color: "#8e8e8e" },
  inputSection: { borderTopWidth: 1, borderTopColor: "#f0f0f0", backgroundColor: "#fff", padding: 12, paddingBottom: 30 },
  replyPreviewContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f2f5", padding: 10, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: "#007AFF" },
  replyPreviewContent: { flex: 1 },
  replyPreviewTitle: { fontSize: 12, fontWeight: '700', color: "#007AFF", marginBottom: 2 },
  replyPreviewText: { fontSize: 12, color: "#65676b" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  textInput: { flex: 1, backgroundColor: "#f0f2f5", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 15 },
  sendBtn: { color: "#0084ff", fontWeight: "800", fontSize: 15 },
  // Action Sheet
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuContent: { backgroundColor: '#fff', margin: 16, borderRadius: 24, paddingBottom: 8 },
  menuItem: { padding: 18, alignItems: 'center' },
  borderTop: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  menuText: { fontSize: 16, color: '#007AFF' },
  menuCancel: { padding: 18, alignItems: 'center', marginTop: 8, borderTopWidth: 8, borderTopColor: '#f0f0f0' },
  // Custom Alert Style
  alertOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  alertBox: { backgroundColor: "#FFF", width: "85%", borderRadius: 28, padding: 24, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  alertIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  alertTitle: { fontSize: 20, fontWeight: "800", color: "#1F2937", marginBottom: 8 },
  alertMessage: { fontSize: 15, color: "#6B7280", textAlign: "center", marginBottom: 24, lineHeight: 22 },
  alertActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  alertBtnBase: { flex: 1, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  btnCancelAlert: { backgroundColor: '#F3F4F6' },
  btnConfirmAlert: { backgroundColor: '#FF3B30' },
  btnTextCancelAlert: { color: '#4B5563', fontWeight: '700' },
  alertBtnTextAlert: { color: "#FFF", fontWeight: "700" },
});