import CustomHeader from "@/component/custom/CustomHeader";
import PostActionBar from "@/component/post/PostActionBar";
import PostCaption from "@/component/post/PostCaption";
import PostHeader from "@/component/post/PostHeader";
import PostMedia from "@/component/post/PostMedia";
import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { getRelativeTimeFromISO } from "@/utils/date";
import { router, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  CornerDownRight,
  Edit3,
  Globe,
  Lock,
  Trash2,
  Users,
  X
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ================= TYPES & CONSTANTS ================= */
type Scope = "public" | "friends" | "only_me";

const SCOPE_OPTIONS = [
  { id: "public", label: "Công khai", desc: "Bất kỳ ai cũng có thể xem", Icon: Globe },
  { id: "friends", label: "Bạn bè", desc: "Chỉ bạn bè của bạn", Icon: Users },
  { id: "only_me", label: "Chỉ mình tôi", desc: "Chỉ mình bạn mới thấy", Icon: Lock },
];

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Edit Post States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editScope, setEditScope] = useState<Scope>("public");
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Comment & Reply States
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, type: "success", title: "", message: "" });

  /* ================= EFFECTS ================= */
  useEffect(() => {
    AuthHelper.getInstance().getUserId().then(setCurrentUserId);
    fetchData();

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => { show.remove(); hide.remove(); };
  }, [id]);

  /* ================= DATA NORMALIZATION ================= */
  // Hàm này xử lý an toàn để không bị lỗi .map is not a function
  const normalizeComments = (list: any[], userId: string | null): any[] => {
    if (!list || !Array.isArray(list)) return [];

    return list
      .map((c) => ({
        ...c,
        liked: Array.isArray(c.reactions) ? c.reactions.some((r: any) => r.userId === userId) : false,
        likeCount: Array.isArray(c.reactions) ? c.reactions.length : 0,
        replies: normalizeComments(c.replies || [], userId), // Đệ quy an toàn cho reply
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  /* ================= API ACTIONS ================= */
  const fetchData = async () => {
    setLoading(true);
    try {
      const api = Api.getInstance();
      const userId = await AuthHelper.getInstance().getUserId();
      const token = await AuthHelper.getInstance().getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [postRes, commentRes] = await Promise.all([
        fetch(`${api.baseUrl}/posts/${id}`, { headers }),
        fetch(`${api.baseUrl}/posts/${id}/comments`, { headers }),
      ]);

      const postJson = await postRes.json();
      const commentJson = await commentRes.json();

      if (postJson.data) {
        setPost(postJson.data);
        setEditContent(postJson.data.text || "");
        setEditScope((postJson.data.privacy?.toLowerCase() as Scope) || "public");
      }
      
      // Xử lý comment data (phòng trường hợp API trả về .items hoặc trực tiếp mảng)
      const rawComments = commentJson.data?.items || commentJson.data || [];
      setComments(normalizeComments(rawComments, userId));

    } catch (e) {
      console.error("Fetch Data Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: "success" | "error" | "warning", title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({ visible: true, type, title, message, onConfirm });
  };

  const handleUpdatePost = async () => {
    setIsUpdating(true);
    try {
      const api = Api.getInstance();
      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(`${api.baseUrl}/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: editContent, privacy: editScope.toUpperCase() }),
      });

      if (res.ok) {
        setIsEditModalVisible(false);
        fetchData();
        showAlert("success", "Thành công", "Bài viết của bạn đã được cập nhật.");
      } else { throw new Error(); }
    } catch (error) {
      showAlert("error", "Lỗi", "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const api = Api.getInstance();
      const token = await AuthHelper.getInstance().getAccessToken();
      await fetch(`${api.baseUrl}/posts/${id}/comments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, parentCommentId: replyTo?.id || null }),
      });
      setNewComment("");
      setReplyTo(null);
      Keyboard.dismiss();
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeletePost = async () => {
    try {
      const api = Api.getInstance();
      const token = await AuthHelper.getInstance().getAccessToken();
      const res = await fetch(`${api.baseUrl}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Sau khi xóa thành công, hiển thị thông báo rồi quay lại trang trước
        showAlert("success", "Thành công", "Bài viết đã được xóa bỏ.", () => {
          router.replace('/(main)/(tabs)/home');
        });
      } else {
        throw new Error("Xóa thất bại");
      }
    } catch (error) {
      console.error("Delete Post Error:", error);
      showAlert("error", "Lỗi", "Không thể xóa bài viết. Vui lòng thử lại sau.");
    }
  };

  /* ================= RENDER HELPERS ================= */
  const CurrentScope = SCOPE_OPTIONS.find((o) => o.id === editScope) || SCOPE_OPTIONS[0];

  const renderCommentItem = ({ item }: any) => (
    <View style={styles.commentWrapper}>
      <View style={styles.commentRow}>
        <Image
          source={{ uri: item.author?.avatarUrl || `https://ui-avatars.com/api/?name=${item.author?.name}` }}
          style={styles.avatar}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentAuthor}>{item.author?.name || "Người dùng"}</Text>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
          <View style={styles.commentActions}>
            <TouchableOpacity><Text style={[styles.actionBtn, item.liked && { color: 'red' }]}>{item.liked ? '❤️' : 'Thích'} {item.likeCount > 0 ? item.likeCount : ""}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setReplyTo({ id: item.id, name: item.author?.name });
            }}><Text style={styles.actionBtn}>Trả lời</Text></TouchableOpacity>
            <Text style={styles.commentTime}>{getRelativeTimeFromISO(item.createdAt)}</Text>
          </View>
        </View>
      </View>
      {/* Hiển thị Reply lồng nhau trực tiếp */}
      {Array.isArray(item.replies) && item.replies.map((reply: any) => (
        <View key={reply.id} style={[styles.commentRow, styles.replyRow]}>
          <CornerDownRight size={14} color="#ccc" style={{ marginTop: 10 }} />
          <Image
            source={{ uri: reply.author?.avatarUrl || `https://ui-avatars.com/api/?name=${reply.author?.name}` }}
            style={[styles.avatar, { width: 28, height: 28 }]}
          />
          <View style={styles.commentContent}>
            <View style={styles.commentBubble}>
              <Text style={styles.commentAuthor}>{reply.author?.name || "Người dùng"}</Text>
              <Text style={styles.commentText}>{reply.content}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color={Colors.blue[500]} /></View>;

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === "ios" ? keyboardHeight : 0 }]}>
      <CustomHeader>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}><X size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
          <View style={styles.headerRightActions}>
            {post?.authorId === currentUserId && (
              <>
                <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.headerIconButton}><Edit3 size={22} color="#FFF" /></TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => showAlert("warning", "Xóa bài viết?", "Bạn có chắc muốn xóa bài viết này không?", handleDeletePost)} 
                  style={styles.headerIconButton}
                >
                  <Trash2 size={22} color="#FFF" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </CustomHeader>

      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.mainPostArea}>
            <PostHeader author={post?.author} createdAt={post?.createdAt} privacy={post?.privacy} />
            <View style={styles.mainContent}>
              {post?.text ? <PostCaption text={post.text} /> : <View style={{ height: 10 }} />}
              {post?.sharedFrom && (
                <TouchableOpacity style={styles.repostContainer} onPress={() => router.push(`/(main)/postDetail/${post.sharedFrom.id}`)}>
                  <PostHeader author={post.sharedFrom.author} createdAt={post.sharedFrom.createdAt} privacy={post.sharedFrom.privacy} />
                  <View style={{ paddingBottom: 10 }}>
                    {post.sharedFrom.text && <PostCaption text={post.sharedFrom.text} />}
                    {post.sharedFrom.media?.length > 0 && <PostMedia media={post.sharedFrom.media} />}
                  </View>
                </TouchableOpacity>
              )}
              {post?.media?.length > 0 && <PostMedia media={post.media} />}
            </View>
            <View style={styles.divider} />
            <PostActionBar postId={post?.id} commentCount={comments.length} post={post} showComment={false} />
            <View style={styles.sectionHeader}><Text style={styles.commentTitle}>Bình luận ({comments.length})</Text></View>
          </View>
        }
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />

      {/* INPUT AREA */}
      <View style={styles.inputContainer}>
        {replyTo && (
          <View style={styles.replyHint}>
            <Text style={styles.replyHintText}>Đang trả lời <Text style={{ fontWeight: "700" }}>{replyTo.name}</Text></Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}><X size={16} color="#65676b" /></TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <Image source={{ uri: post?.author?.avatarUrl }} style={styles.inputAvatar} />
          <TextInput 
            style={styles.textInput} 
            placeholder="Viết bình luận..." 
            value={newComment} 
            onChangeText={setNewComment} 
            multiline 
          />
          <TouchableOpacity onPress={handleSendComment} disabled={!newComment.trim()}>
            <Text style={[styles.sendText, !newComment.trim() && { color: "#ccc" }]}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* EDIT MODAL */}
      <Modal visible={isEditModalVisible} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <CustomHeader>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.headerIconButton}><X size={24} color="#FFF" /></TouchableOpacity>
              <Text style={styles.headerTitle}>Sửa bài viết</Text>
              <TouchableOpacity onPress={handleUpdatePost} disabled={isUpdating} style={styles.saveBtn}>
                {isUpdating ? <ActivityIndicator size="small" color={Colors.blue[500]} /> : <Text style={styles.saveBtnText}>Lưu</Text>}
              </TouchableOpacity>
            </View>
          </CustomHeader>
          <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16 }}>
            <View style={styles.userInfoRow}>
              <Image source={{ uri: post?.author?.avatarUrl }} style={styles.userAvatar} />
              <View style={styles.userMeta}>
                <Text style={styles.userName}>{post?.author?.name}</Text>
                <TouchableOpacity style={styles.scopeSelector} onPress={() => setShowScopeModal(true)}>
                  <CurrentScope.Icon size={12} color="#65676B" />
                  <Text style={styles.scopeText}>{CurrentScope.label}</Text>
                  <ChevronDown size={12} color="#65676B" />
                </TouchableOpacity>
              </View>
            </View>
            <TextInput style={styles.editInput} multiline value={editContent} onChangeText={setEditContent} autoFocus />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* SCOPE MODAL LỒNG TRONG EDIT */}
        <Modal visible={showScopeModal} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowScopeModal(false)}>
            <View style={styles.scopeModalContent}>
              <View style={styles.modalIndicator} />
              <Text style={styles.modalHeaderTitle}>Quyền riêng tư</Text>
              {SCOPE_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt.id} style={[styles.scopeOption, editScope === opt.id && styles.scopeOptionActive]} onPress={() => { setEditScope(opt.id as Scope); setShowScopeModal(false); }}>
                  <View style={styles.optionLeft}>
                    <View style={styles.optionIconBox}><opt.Icon size={18} color="#1C1E21" /></View>
                    <View><Text style={styles.optionLabel}>{opt.label}</Text><Text style={styles.optionDesc}>{opt.desc}</Text></View>
                  </View>
                  {editScope === opt.id && <Check size={20} color={Colors.blue[500]} />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </Modal>

      {/* CUSTOM ALERT MODAL - STYLE CHUẨN */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconCircle, { backgroundColor: alertConfig.type === "success" ? "#ECFDF5" : alertConfig.type === "warning" ? "#FFFBEB" : "#FEF2F2" }]}>
              {alertConfig.type === "success" && <CheckCircle2 size={32} color="#10B981" />}
              {alertConfig.type === "warning" && <AlertCircle size={32} color="#F59E0B" />}
              {alertConfig.type === "error" && <AlertCircle size={32} color="#EF4444" />}
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            
            <View style={styles.alertActionRow}>
              {alertConfig.type === 'warning' && (
                <TouchableOpacity 
                  style={[styles.alertBtnBase, styles.btnCancel]} 
                  onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
                >
                  <Text style={styles.btnTextCancel}>Hủy</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.alertBtnBase, { backgroundColor: alertConfig.type === "success" ? "#10B981" : "#EF4444" }]}
                onPress={() => {
                  setAlertConfig({ ...alertConfig, visible: false });
                  if (alertConfig.onConfirm) alertConfig.onConfirm();
                }}
              >
                <Text style={styles.alertBtnText}>
                  {alertConfig.type === 'warning' ? 'Xác nhận' : 'Đóng'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1 },
  headerRightActions: { flexDirection: 'row', gap: 5 },
  headerIconButton: { width: 40, height: 40, justifyContent: "center", alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFF" },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainPostArea: { paddingVertical: 12 },
  mainContent: { paddingBottom: 10 },
  divider: { height: 1, backgroundColor: "#f0f2f5", marginHorizontal: 12, marginTop: 10 },
  sectionHeader: { backgroundColor: "#f8f9fa", paddingVertical: 10, marginTop: 5, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  commentTitle: { fontWeight: "700", fontSize: 14, color: "#65676b", paddingHorizontal: 15 },
  listPadding: { paddingBottom: 150 },
  repostContainer: { marginHorizontal: 15, marginTop: 10, marginBottom: 5, borderRadius: 16, borderWidth: 1, borderColor: "#E4E6EB", overflow: "hidden", backgroundColor: "#F7F8FA" },
  commentWrapper: { paddingVertical: 10, paddingHorizontal: 15 },
  commentRow: { flexDirection: "row", gap: 10 },
  replyRow: { marginLeft: 20, marginTop: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#eee" },
  commentContent: { flex: 1 },
  commentBubble: { backgroundColor: "#f0f2f5", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, alignSelf: "flex-start" },
  commentAuthor: { fontWeight: "700", fontSize: 13, color: "#050505" },
  commentText: { fontSize: 14, color: "#050505", marginTop: 2 },
  commentActions: { flexDirection: "row", gap: 15, marginTop: 4, paddingLeft: 5 },
  actionBtn: { fontSize: 12, color: "#65676b", fontWeight: "600" },
  commentTime: { fontSize: 12, color: "#8a8d91" },
  inputContainer: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: "#eee", backgroundColor: "#fff", padding: 10, paddingBottom: Platform.OS === "ios" ? 35 : 15 },
  replyHint: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f0f2f5", paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10, borderRadius: 8 },
  replyHintText: { fontSize: 13, color: "#65676b" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  inputAvatar: { width: 32, height: 32, borderRadius: 16 },
  textInput: { flex: 1, backgroundColor: "#f0f2f5", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, maxHeight: 100, fontSize: 15 },
  sendText: { color: "#0084ff", fontWeight: "700", paddingHorizontal: 5 },
  // Edit Styles
  saveBtn: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15 },
  saveBtnText: { color: Colors.blue[600], fontWeight: '700' },
  userInfoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  userAvatar: { width: 44, height: 44, borderRadius: 22 },
  userMeta: { marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: "700", color: "#1C1E21" },
  scopeSelector: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0F2F5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4, gap: 4 },
  scopeText: { fontSize: 12, fontWeight: "600", color: "#65676B" },
  editInput: { fontSize: 18, color: "#1C1E21", minHeight: 150, textAlignVertical: "top" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  scopeModalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalIndicator: { width: 36, height: 4, backgroundColor: "#E4E6EB", borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalHeaderTitle: { fontSize: 19, fontWeight: "700", color: "#050505", textAlign: "center", marginBottom: 24 },
  scopeOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 16, backgroundColor: "#F7F8FA", marginBottom: 10 },
  scopeOptionActive: { backgroundColor: "#E7F3FF", borderWidth: 1, borderColor: Colors.blue[500] },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  optionIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E4E6EB", justifyContent: "center", alignItems: "center" },
  optionLabel: { fontSize: 16, fontWeight: "700", color: "#050505" },
  optionDesc: { fontSize: 13, color: "#65676B", marginTop: 2 },
  // Alert Style (Fix Align)
  alertOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  alertBox: { backgroundColor: "#FFF", width: "85%", borderRadius: 30, padding: 24, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  alertIconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  alertTitle: { fontSize: 22, fontWeight: "800", color: "#1F2937", marginBottom: 10 },
  alertMessage: { fontSize: 16, color: "#6B7280", textAlign: "center", lineHeight: 24, marginBottom: 28 },
  alertActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  alertBtnBase: { flex: 1, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  btnCancel: { backgroundColor: '#F3F4F6' },
  btnTextCancel: { color: '#4B5563', fontWeight: '700', fontSize: 16 },
  alertBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});