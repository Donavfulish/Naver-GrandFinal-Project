// src/components/onboarding/IntroModal.tsx
"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface IntroModalProps {
    introPages: string[]
    onComplete: () => void
}

export default function IntroModal({ introPages, onComplete }: IntroModalProps) {
    const [currentPage, setCurrentPage] = useState(0)

    const handleNext = () => {
        if (currentPage < introPages.length - 1) {
            setCurrentPage(currentPage + 1)
        } else {
            onComplete() // Hoàn thành Intro, chuyển sang ViewSpace
        }
    }

    const currentText = introPages[currentPage]
    const isLastPage = currentPage === introPages.length - 1

    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
            <motion.div 
                className="w-full max-w-4xl h-full flex flex-col items-center justify-center text-white text-center"
            >
                {/* Text Content */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentPage} 
                        initial="hidden" 
                        animate="visible" 
                        exit="exit"
                        className="space-y-6 max-w-2xl absolute"
                    >
                        {/* Dòng chữ chính từ AI */}
                        <p className="text-3xl md:text-5xl font-extrabold tracking-wide text-[#C7A36B] leading-snug">
                            {currentText}
                        </p>
                        
                        {/* Số trang */}
                        <p className="text-white/50 text-sm pt-4 uppercase tracking-widest">
                            {currentPage + 1} / {introPages.length}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Control Buttons */}
                <div className="absolute bottom-16 flex justify-center w-full">
                    <motion.button
                        onClick={handleNext}
                        className="px-8 py-3 bg-gradient-to-r from-[#C7A36B] to-[#7C9A92] hover:shadow-lg hover:shadow-[#C7A36B]/50 rounded-xl transition font-semibold flex items-center"
                    >
                        {isLastPage ? (
                            <>Enter Space <ArrowRight size={18} className="ml-2" /></>
                        ) : (
                            <>Next <ArrowRight size={18} className="ml-2" /></>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )
}