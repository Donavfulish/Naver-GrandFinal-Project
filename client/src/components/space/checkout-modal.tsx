// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { useRouter } from 'next/navigation'
// import { useSessionStore } from "@/lib/store"
// // import { generateInsight, getReflectionQuestion, getSuggestedTags } from "@/lib/ai-logic"

// interface CheckoutModalProps {
//   onClose: () => void
//   duration: number
// }

// const CheckoutModal = ({ onClose, duration }: CheckoutModalProps) => {
//   const router = useRouter()
//   const {
//     notes,
//     userFeeling,
//     vibeConfig,
//     setReflectionAnswer,
//     setSelectedTags,
//     saveCapsule,
//     resetSession,
//   } = useSessionStore()

//   const [step, setStep] = useState<"summary" | "reflection" | "packaging">("summary")
//   const [reflectionText, setReflectionText] = useState("")
//   const [selectedTags, setSelectedTagsLocal] = useState<string[]>([])
//   const [isAnimating, setIsAnimating] = useState(false)

// //   const insight = generateInsight(notes.length, notes.length > 0, userFeeling)
// //   const reflectionQuestion = getReflectionQuestion(vibeConfig.mood)
// //   const suggestedTags = getSuggestedTags(vibeConfig.mood)

//   const handlePackageCapsule = () => {
//     setIsAnimating(true)
//     setTimeout(() => {
//       setReflectionAnswer(reflectionText)
//       setSelectedTags(selectedTags)

//       const capsule = {
//         id: `capsule-${Date.now()}`,
//         created_at: new Date().toISOString(),
//         mood: userFeeling,
//         duration: Math.floor(duration / 60),
//         notes,
//         reflection_answer: reflectionText,
//         tags: selectedTags,
//         vibe_config: vibeConfig,
//         //session_summary: insight,
//       }

//       //saveCapsule(capsule)
//       resetSession()

//       router.push("/capsules")
//     }, 2000)
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-end md:items-center justify-center p-4"
//     >
//       <motion.div
//         initial={{ y: 100, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         exit={{ y: 100, opacity: 0 }}
//         transition={{ type: "spring", damping: 30 }}
//         className="w-full md:w-full md:max-w-2xl bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] border border-white/10 rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
//       >
//         {/* Step: Summary */}
//         {step === "summary" && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="space-y-6"
//           >
//             <h2 className="text-3xl font-bold text-white">Session Complete</h2>

//             <div className="grid grid-cols-3 gap-4">
//               <div className="bg-white/5 rounded-lg p-4 text-center">
//                 <div className="text-2xl font-bold text-[#C7A36B]">{Math.floor(duration / 60)}</div>
//                 <div className="text-xs text-white/60 mt-1">minutes</div>
//               </div>
//               <div className="bg-white/5 rounded-lg p-4 text-center">
//                 <div className="text-2xl font-bold text-[#7C9A92]">{notes.length}</div>
//                 <div className="text-xs text-white/60 mt-1">notes</div>
//               </div>
//               <div className="bg-white/5 rounded-lg p-4 text-center">
//                 <div className="text-2xl font-bold text-white">{vibeConfig.mood}</div>
//                 <div className="text-xs text-white/60 mt-1">mood</div>
//               </div>
//             </div>

//             <div className="bg-white/5 rounded-lg p-4">
//               {/* <p className="text-white/80">{insight}</p> */}
//             </div>

//             <button
//               onClick={() => setStep("reflection")}
//               className="w-full bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold py-3 rounded-lg transition"
//             >
//               Continue to Reflection
//             </button>
//           </motion.div>
//         )}

//         {/* Step: Reflection */}
//         {step === "reflection" && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="space-y-6"
//           >
//             <h2 className="text-3xl font-bold text-white">Reflect on Your Session</h2>

//             <div className="space-y-3">
//               {/* //<p className="text-white font-medium">{reflectionQuestion}</p> */}
//               <textarea
//                 value={reflectionText}
//                 onChange={(e) => setReflectionText(e.target.value)}
//                 placeholder="Your thoughts..."
//                 className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C7A36B]/50 min-h-24"
//               />
//             </div>

//             <div className="space-y-3">
//               <p className="text-white font-medium">Add tags (optional)</p>
//               {/* <div className="flex flex-wrap gap-2">
//                 {suggestedTags.map((tag) => (
//                   <button
//                     key={tag}
//                     onClick={() => {
//                       setSelectedTagsLocal((prev) =>
//                         prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
//                       )
//                     }}
//                     className={`px-3 py-1 rounded-full text-sm font-medium transition ${
//                       selectedTags.includes(tag)
//                         ? "bg-[#C7A36B] text-[#1E1E1E]"
//                         : "bg-white/10 text-white hover:bg-white/20"
//                     }`}
//                   >
//                     {tag}
//                   </button>
//                 ))}
//               </div> */}
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setStep("summary")}
//                 className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition border border-white/20"
//               >
//                 Back
//               </button>
//               <button
//                 onClick={() => setStep("packaging")}
//                 className="flex-1 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold py-3 rounded-lg transition"
//               >
//                 Package Capsule
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {/* Step: Packaging Animation */}
//         {step === "packaging" && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="space-y-6 flex flex-col items-center justify-center min-h-64"
//           >
//             {!isAnimating ? (
//               <>
//                 <h2 className="text-3xl font-bold text-white text-center">Ready to package?</h2>
//                 <button
//                   onClick={handlePackageCapsule}
//                   className="bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/30 text-white font-semibold px-8 py-3 rounded-lg transition"
//                 >
//                   Package Capsule
//                 </button>
//               </>
//             ) : (
//               <motion.div
//                 animate={{ rotate: 360, scale: [1, 1.2, 1] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//                 className="w-32 h-32 relative flex items-center justify-center"
//               >
//                 <div className="w-24 h-24 bg-gradient-to-br from-[#C7A36B] to-[#7C9A92] rounded-full opacity-20" />
//                 <motion.div
//                   animate={{ scale: [0.8, 1.1, 0.8] }}
//                   transition={{ duration: 1.5, repeat: Infinity }}
//                   className="absolute w-16 h-16 bg-gradient-to-br from-[#C7A36B] to-[#7C9A92] rounded-full flex items-center justify-center text-white text-2xl"
//                 >
//                   ✓
//                 </motion.div>
//               </motion.div>
//             )}
//           </motion.div>
//         )}
//       </motion.div>
//     </motion.div>
//   )
// }

// export default CheckoutModal

// src/components/space/CheckoutModal.tsx
"use client"
import { motion } from 'framer-motion';
import { useSessionStore, SettingsPreview } from "@/lib/store";
import { useGenerateAISpace, SpaceData } from '@/hooks/useGenerateAiSpace';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSpaceFonts } from '@/hooks/useSpaceFonts'; 

const MOCK_USER_ID = "cca57402-8009-4dcb-b0ff-348268a00213"; 

interface CheckoutModalProps {
    onClose: () => void;
    duration: number; 
    spaceData: SpaceData; // Dữ liệu AI gốc
}

// Hàm formatTime (Tái sử dụng)
const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}:${s.toString().padStart(2, "0")}`
}


export default function CheckoutModal({ onClose, duration, spaceData }: CheckoutModalProps) {
    const router = useRouter();
    const { notes, finalSettings, resetSession } = useSessionStore();
    
    // Lấy các ID mapping để gửi lên backend
    const { clockStyles, textStyles } = useSpaceFonts(); 
    
    const { confirmSpaceGeneration } = useGenerateAISpace();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // LẤY NỘI DUNG NOTE STRING (Bỏ qua tọa độ)
    const notesContent = notes
        .map(n => n.text)
        .filter(text => text.trim() !== "");
    
    // Hàm tìm ID từ tên style/font (dùng cho payload)
    const findIdByStyleName = (styleName: string) => 
        clockStyles.find(item => item.style === styleName)?.id || null;

    const findIdByFontName = (fontName: string) => 
        textStyles.find(item => item.font_name === fontName)?.id || null;


    const handlePackage = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        // 1. Xác định cấu hình cuối cùng (FinalSettings hoặc AI gốc)
        const finalSettingsUsed: SettingsPreview = finalSettings || {
            // Khởi tạo SettingsPreview nếu finalSettings là null
            clockStyle: spaceData.clock_font.style || 'minimal',
            clockFont: spaceData.text_font.font_name || 'Inter',
            background: spaceData.background.url,
            layout: 'centered-blur',
        };
        
        // 2. Lấy các ID cấu hình cuối cùng
        const finalClockFontId = findIdByStyleName(finalSettingsUsed.clockStyle) || spaceData.clock_font.id || null;

        const finalTextFontId = findIdByFontName(finalSettingsUsed.clockFont) || spaceData.text_font.id || null;

        const finalBackgroundUrl = finalSettingsUsed.background;
        
        // 3. Xây dựng Payload
        const createBody = {
            user_id: MOCK_USER_ID,
            name: spaceData.name,
            tags: spaceData.tags,
            description: spaceData.description || null,
            mood: spaceData.mood, 
            duration: duration, 
            notes: notesContent, // <-- CHỈ GỬI STRING ARRAY
            
            background_url: finalBackgroundUrl,
            clock_font_id: finalClockFontId, 
            text_font_id: finalTextFontId, 
            tracks: spaceData.playlist.tracks.map(t => t.id),
            prompt: spaceData.prompt || null,
        };

        try {
            // 4. GỌI API Confirm (CREATE SPACE)
            await confirmSpaceGeneration(createBody);
            
            // 5. Xử lý thành công
            alert("Space đã được lưu thành công!");
            resetSession(); // Xóa session store
            router.push("/capsules"); // Chuyển hướng đến danh sách Space đã lưu
            
        } catch (error) {
            console.error("Lỗi khi lưu gói:", error);
            alert("Lỗi server: Không thể tạo gói Space. Vui lòng kiểm tra console.");
        } finally {
            setIsSubmitting(false);
            onClose();
        }
    };

    return (
        <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
            <div className="bg-[#1E1E1E] p-8 rounded-2xl text-white max-w-sm w-full">
                <h3 className="text-2xl font-bold mb-4">Session Ended</h3>
                <p className="mb-2">Duration: <span className="text-[#C7A36B]">{formatTime(duration)}</span></p>
                <p className="mb-4">Notes captured: <span className="text-[#C7A36B]">{notesContent.length}</span></p>

                <button 
                    onClick={handlePackage} 
                    disabled={isSubmitting}
                    className="w-full mt-4 px-4 py-3 bg-[#C7A36B] text-[#1E1E1E] rounded-lg font-semibold hover:bg-[#D4B896] disabled:opacity-50 flex items-center justify-center"
                >
                    {isSubmitting ? (
                        <>
                            <Loader size={20} className="animate-spin mr-2" />
                            Packaging...
                        </>
                    ) : (
                        "Package & Save Space"
                    )}
                </button>
                <button onClick={onClose} className="w-full mt-2 text-white/50 hover:text-white transition">
                    Keep working
                </button>
            </div>
        </motion.div>
    );
}