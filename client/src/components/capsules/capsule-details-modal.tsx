// src/components/capsules/capsule-detail-modal.tsx
"use client"

import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, ArrowLeft } from "lucide-react";
import { Capsule } from "@/lib/store";

interface CapsuleDetailModalProps {
  capsule: Capsule;
  isOpen: boolean;
  onClose: () => void;
}

export default function CapsuleDetailModal({
  capsule,
  isOpen,
  onClose,
}: CapsuleDetailModalProps) {
  const date = new Date(capsule.created_at || Date.now());
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getMoodGradient = (mood: string) => {
    const colors: Record<string, string> = {
      inspired: "from-red-500 to-orange-500",
      focused: "from-yellow-500 to-orange-500",
      productive: "from-purple-500 to-pink-500",
      peaceful: "from-green-500 to-blue-500",
      tired: "from-indigo-500 to-purple-500",
    };

    for (const [key, color] of Object.entries(colors)) {
      if (mood.toLowerCase().includes(key)) return color;
    }
    return "from-[#C7A36B] to-[#7C9A92]";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl"
            >
              {/* Main Image Section - Takes up most of the space */}
              <div className="relative h-[70vh]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: capsule.background?.background_url
                      ? `url(${capsule.background.background_url})`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                />
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />

                {/* Back Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 left-6 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-all duration-200 group border border-white/20"
                >
                  <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-all duration-200 group border border-white/20"
                >
                  <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
                </button>

                {/* Title & Mood Badge - Floating on image */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex flex-col items-center gap-3">
                    <h2 className="text-4xl font-bold text-white capitalize drop-shadow-2xl text-center">
                      {capsule.name}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div
                        className={`bg-gradient-to-r ${getMoodGradient(
                          capsule.mood
                        )} px-5 py-2 rounded-full text-white font-semibold shadow-2xl backdrop-blur-sm border border-white/20`}
                      >
                        {capsule.mood}
                      </div>
                      <span className="text-white/90 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section - Compact at bottom */}
              <div className="bg-gradient-to-br from-[#1a1625] to-[#0f1419] p-8 space-y-6 max-h-[25vh] overflow-y-auto">
                {/* Description */}
                {capsule.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                      Description
                    </h3>
                    <p className="text-white/90 leading-relaxed text-lg">
                      {capsule.description}
                    </p>
                  </div>
                )}

                {/* Session Summary */}
                {capsule.session_summary && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                      Summary
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {capsule.session_summary}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {capsule.tags && capsule.tags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {capsule.tags.map((tag, idx) => (
                        <motion.span
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          className="px-4 py-2 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-full text-sm text-white/90 border border-white/20 transition-all backdrop-blur-sm font-medium"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}