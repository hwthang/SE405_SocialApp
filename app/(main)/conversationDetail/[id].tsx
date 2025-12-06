// // app/(main)/(tabs)/conversation/[id].tsx

// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useState } from "react";
// import { View } from "react-native";

// import ChatHeader from "../../../component/message/ChatHeader";
// import InputBar from "../../../component/message/InputBar";
// import MessageList from "../../../component/message/MessageList";
// import PinnedMessage from "../../../component/message/PinnedMessage";

// // Mock data
// const mockMessages = [
//   { id: "1", text: "hello", isMe: false },
//   { id: "2", text: "chào", isMe: false },
//   { id: "3", text: "Bạn ở đâu", isMe: true },
//   { id: "4", text: "tại trường", isMe: false },
//   { id: "5", text: "Ra r", isMe: true },
//   { id: "6", text: "Ra đâu, đi hắn lên viae hè ấy", isMe: false },
// ];

// export default function ChatDetailScreen() {
//   const router = useRouter();
//   const { id } = useLocalSearchParams();

//   const [message, setMessage] = useState("");
//   const [list, setList] = useState(mockMessages);

//   const pinned = "Hẹn tối nay 7h nhré"; 

//   const handleSend = () => {
//     if (!message.trim()) return;

//     setList((prev) => [
//       ...prev,
//       {
//         id: String(prev.length + 1),
//         text: message,
//         isMe: true,
//       },
//     ]);

//     setMessage("");
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
//       {/* Header */}
//       <ChatHeader
//         name="Tình iu tuyệt vời"
//         avatar="https://i.pinimg.com/originals/25/6a/e4/256ae40f4af0b506f7f6ffdbb9a09a1e.jpg"
//         onBack={() => router.back()}
//       />

//       {/* Pinned Message (optional) */}
//       <PinnedMessage text={pinned} />

//       {/* Message List */}
//       <MessageList data={list} />

//       {/* Input Bar */}
//       <InputBar value={message} onChange={setMessage} onSend={handleSend} />
//     </View>
//   );
// }

// app/(main)/conversationDetail/[id].tsx

// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useState } from "react";
// import { View } from "react-native";

// import ChatHeader from "../../../component/message/ChatHeader";
// import InputBar from "../../../component/message/InputBar";
// import MessageList from "../../../component/message/MessageList";
// import PinnedMessage from "../../../component/message/PinnedMessage";

// const mockMessages = [
//   { id: "1", text: "hello", isMe: false },
//   { id: "2", text: "chào", isMe: false },
//   { id: "3", text: "Bạn ở đâu", isMe: true },
//   { id: "4", text: "tại trường", isMe: false },
//   { id: "5", text: "Ra r", isMe: true },
//   { id: "6", text: "Ra đâu, đi hắn lên viae hè ấy", isMe: false },
// ];

// export default function ChatDetailScreen() {
//   const router = useRouter();
//   const { id } = useLocalSearchParams();

//   const [message, setMessage] = useState("");
//   const [list, setList] = useState(mockMessages);
//   const [typing, setTyping] = useState(false);

//   const pinned = "Hẹn tối nay 7h nhé";

//   // gửi tin nhắn
//   const handleSend = () => {
//     if (!message.trim()) return;

//     setList((prev) => [
//       ...prev,
//       {
//         id: String(prev.length + 1),
//         text: message,
//         isMe: true,
//       },
//     ]);

//     setMessage("");

//     // fake "typing" từ người kia
//     setTyping(true);
//     setTimeout(() => setTyping(false), 1200);
//   };

//   // xóa
//   const handleDelete = (id: string) => {
//     setList((prev) => prev.filter((m) => m.id !== id));
//   };

//   // reply
//   const handleReply = (msg: any) => {
//     setMessage(msg.text + " "); // giống Messenger → chèn lại text
//   };

//   // reaction
//   const handleReact = (id: string, emoji: string) => {
//     setList((prev) =>
//       prev.map((m) =>
//         m.id === id ? { ...m, reaction: emoji } : m
//       )
//     );
//   };

// //   return (
// //     <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
// //       {/* Header */}
// //       <ChatHeader
// //         name="Nguyễn Văn A"
// //         avatar="https://i.pravatar.cc/150?img=1"
// //         onBack={() => router.back()}
// //       />

// //       {/* Pinned Message */}
// //       <PinnedMessage text={pinned} />

// //       {/* Message List */}
// //       <MessageList
// //         messages={list}
// //         typing={typing}
// //         onDelete={handleDelete}
// //         onReply={handleReply}
// //         onReact={handleReact}
// //       />

// //       {/* Input */}
// //       {/* <InputBar value={message} onChange={setMessage} onSend={handleSend} /> */}
// //       <InputBar
// //   value={message}
// //   onChange={setMessage}
// //   onSend={handleSend}
// //   onTyping={(state: boolean) => setTyping(state)}
// //   onSendImage={() => {}}
// //   onRecordVoice={() => {}}
// //   onOpenSticker={() => {}}
// // />

// //     </View>
// //   );
// // }
// return (
//   <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>

//     <ChatHeader
//       name="Nguyễn Văn A"
//       avatar="https://i.pravatar.cc/150?img=1"
//       onBack={() => router.back()}
//     />

//     <PinnedMessage text={pinned} />

//     <View style={{ flex: 1 }}>
//       <MessageList
//         messages={list}
//         typing={typing}
//         onDelete={handleDelete}
//         onReply={handleReply}
//         onReact={handleReact}
//       />
//     </View>

//     <InputBar
//       value={message}
//       onChange={setMessage}
//       onSend={handleSend}
//       onTyping={(state: boolean) => setTyping(state)}
//       onSendImage={() => {}}
//       onRecordVoice={() => {}}
//     />
//   </View>
// );
// }

// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useState } from "react";
// import { View } from "react-native";

// import ChatHeader from "../../../component/message/ChatHeader";
// import InputBar from "../../../component/message/InputBar";
// import MessageList from "../../../component/message/MessageList";
// import PinnedMessage from "../../../component/message/PinnedMessage";

// type MessageType = {
//   id: string;
//   text: string;
//   isMe: boolean;
//   reaction?: string;
// };

// const mockMessages: MessageType[] = [
//   { id: "1", text: "hello", isMe: false },
//   { id: "2", text: "chào", isMe: false },
//   { id: "3", text: "Bạn ở đâu", isMe: true },
//   { id: "4", text: "tại trường", isMe: false },
//   { id: "5", text: "Ra r", isMe: true },
//   { id: "6", text: "Ra đâu, đi hắn lên viae hè ấy", isMe: false },
// ];

// export default function ChatDetailScreen() {
//   const router = useRouter();
//   const { id } = useLocalSearchParams();

//   const [message, setMessage] = useState("");
//   const [list, setList] = useState<MessageType[]>(mockMessages);
//   const [typing, setTyping] = useState(false);

//   const pinned = "Hẹn tối nay 7h nhé";

//   // Gửi tin nhắn
//   const handleSend = () => {
//     if (!message.trim()) return;

//     setList((prev) => [
//       ...prev,
//       {
//         id: String(prev.length + 1),
//         text: message,
//         isMe: true,
//       },
//     ]);

//     setMessage("");

//     // Fake typing của người kia
//     setTyping(true);
//     setTimeout(() => setTyping(false), 1200);
//   };

//   // Xóa tin nhắn
//   const handleDelete = (id: string) => {
//     setList((prev) => prev.filter((m) => m.id !== id));
//   };

//   // Reply
//   const handleReply = (msg: MessageType) => {
//     setMessage(msg.text + " ");
//   };

//   // Reaction
//   const handleReact = (id: string, emoji: string) => {
//     setList((prev) =>
//       prev.map((m) => (m.id === id ? { ...m, reaction: emoji } : m))
//     );
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>

//       {/* HEADER */}
//       <ChatHeader
//         name="Nguyễn Văn A"
//         avatar="https://i.pravatar.cc/150?img=1"
//         onBack={() => router.back()}
//       />

//       {/* PINNED MESSAGE */}
//       <PinnedMessage text={pinned} />

//       {/* DANH SÁCH TIN NHẮN */}
//       <View style={{ flex: 1 }}>
//         <MessageList
//           messages={list}
//           typing={typing}
//           onDelete={handleDelete}
//           onReply={handleReply}
//           onReact={handleReact}
//         />
//       </View>

//       {/* INPUT BAR */}
//       <InputBar
//         value={message}
//         onChange={setMessage}
//         onSend={handleSend}
//         onTyping={(state) => setTyping(state)}
//         onSendImage={() => {}}
//         onRecordVoice={() => {}}
//       />
//     </View>
//   );
// }

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

import ChatHeader from "../../../component/message/ChatHeader";
import InputBar from "../../../component/message/InputBar";
import MessageList from "../../../component/message/MessageList";
import PinnedMessage from "../../../component/message/PinnedMessage";

type MessageType = {
  id: string;
  text?: string;
  image?: string;
  audio?: string;
  isMe: boolean;
  reaction?: string;
};

const mockMessages: MessageType[] = [
  { id: "1", text: "hello", isMe: false },
  { id: "2", text: "chào", isMe: false },
  { id: "3", text: "Bạn ở đâu", isMe: true },
  { id: "4", text: "tại trường", isMe: false },
  { id: "5", text: "Ra r", isMe: true },
  { id: "6", text: "Ra đâu, đi hắn lên viae hè ấy", isMe: false },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [message, setMessage] = useState("");
  const [list, setList] = useState<MessageType[]>(mockMessages);
  const [typing, setTyping] = useState(false);

  const pinned = "Hẹn tối nay 7h nhé";

  // ===================== SEND TEXT =====================
  const handleSend = () => {
    if (!message.trim()) return;

    setList((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        text: message,
        isMe: true,
      },
    ]);

    setMessage("");

    // Fake typing của người kia
    setTyping(true);
    setTimeout(() => setTyping(false), 1200);
  };

  // ===================== SEND IMAGE =====================
  const handleSendImage = (uri: string) => {
    setList((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        image: uri,
        isMe: true,
      },
    ]);
  };

  // ===================== SEND AUDIO =====================
  const handleRecordVoice = (uri: string) => {
    setList((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        audio: uri,
        isMe: true,
      },
    ]);
  };

  // ===================== DELETE =====================
  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((m) => m.id !== id));
  };

  // ===================== REPLY =====================
  const handleReply = (msg: MessageType) => {
    if (msg.text) setMessage(msg.text + " ");
    if (msg.image) setMessage("[Hình ảnh] ");
    if (msg.audio) setMessage("[Voice] ");
  };

  // ===================== REACTION =====================
  const handleReact = (id: string, emoji: string) => {
    setList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, reaction: emoji } : m))
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      {/* HEADER */}
      <ChatHeader
        name="Nguyễn Văn A"
        avatar="https://i.pravatar.cc/150?img=1"
        onBack={() => router.back()}
      />

      {/* PINNED MESSAGE */}
      <PinnedMessage text={pinned} />

      {/* LIST */}
      <View style={{ flex: 1 }}>
        <MessageList
          messages={list}
          typing={typing}
          onDelete={handleDelete}
          onReply={handleReply}
          onReact={handleReact}
        />
      </View>

      {/* INPUT BAR */}
      <InputBar
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        onTyping={(state) => setTyping(state)}
        onSendImage={handleSendImage}
        onRecordVoice={handleRecordVoice}
      />
    </View>
  );
}
