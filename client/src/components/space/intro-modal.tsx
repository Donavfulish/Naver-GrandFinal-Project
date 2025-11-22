// src/components/onboarding/IntroModal.tsx
"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface IntroModalProps {
    introPages: string[]
    onComplete: () => void
}

export default function IntroModal({ introPages, onComplete }: IntroModalProps) {
    const [currentPage, setCurrentPage] = useState(0)
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        const currentText = introPages[currentPage]
        const readingTime = Math.max(5000, currentText.length * 80)

        const timer = setTimeout(() => {
            if (currentPage < introPages.length - 1) {
                setCurrentPage(currentPage + 1)
            } else {
                setIsComplete(true)
                setTimeout(() => {
                    onComplete()
                }, 3500)
            }
        }, readingTime)

        return () => clearTimeout(timer)
    }, [currentPage, introPages, onComplete])

    const currentText = introPages[currentPage]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            filter: "blur(10px)",
            transition: { duration: 0.5 }
        }
    }

    const charVariants = {
        hidden: { 
            opacity: 0,
            y: 20,
            filter: "blur(8px)"
        },
        visible: { 
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 100
            }
        }
    }

    const pageVariants = {
        enter: {
            rotateY: -90,
            opacity: 0,
            scale: 0.8
        },
        center: {
            rotateY: 0,
            opacity: 1,
            scale: 1,
            transition: {
                rotateY: { type: "spring" as const, stiffness: 100, damping: 20 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
            }
        },
        exit: {
            rotateY: 90,
            opacity: 0,
            scale: 0.8,
            transition: {
                rotateY: { type: "spring" as const, stiffness: 100, damping: 20 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
            }
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-zinc-950 to-black p-4 overflow-hidden"
        >
            {/* Enhanced background with softer gradients */}
            <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                    background: [
                        "radial-gradient(circle at 20% 30%, #E8D4A8 0%, transparent 40%)",
                        "radial-gradient(circle at 80% 60%, #9BC4BC 0%, transparent 40%)",
                        "radial-gradient(circle at 50% 90%, #F5E6D3 0%, transparent 40%)",
                        "radial-gradient(circle at 20% 30%, #E8D4A8 0%, transparent 40%)",
                    ]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Subtle light rays */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#E8D4A8] to-transparent" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#9BC4BC] to-transparent" />
            </div>

            {/* Main content container - More compact */}
            <div className="w-full max-w-3xl h-full flex flex-col items-center justify-between text-white relative perspective-1000 py-16">
                {/* Progress bars - more compact */}
                <motion.div 
                    className="flex gap-2.5 z-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {introPages.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`h-1 rounded-full transition-all duration-500 ${
                                index === currentPage 
                                    ? 'w-10 bg-gradient-to-r from-[#E8D4A8] via-[#D4B886] to-[#9BC4BC]' 
                                    : index < currentPage
                                    ? 'w-6 bg-[#E8D4A8]/50'
                                    : 'w-6 bg-white/25'
                            }`}
                            animate={{
                                scale: index === currentPage ? [1, 1.15, 1] : 1,
                                boxShadow: index === currentPage 
                                    ? [
                                        '0 0 8px rgba(232, 212, 168, 0.3)',
                                        '0 0 16px rgba(232, 212, 168, 0.6)',
                                        '0 0 8px rgba(232, 212, 168, 0.3)'
                                    ]
                                    : '0 0 0px rgba(0, 0, 0, 0)'
                            }}
                            transition={{
                                scale: {
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }
                            }}
                        />
                    ))}
                </motion.div>

                {/* Text Content - More compact sizing */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        variants={pageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="max-w-2xl px-6 text-center flex-1 flex items-center justify-center"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug tracking-tight"
                        >
                            {currentText.split(' ').map((word, wordIndex) => (
                                <motion.span
                                    key={`${currentPage}-word-${wordIndex}`}
                                    variants={charVariants}
                                    className="inline-block bg-gradient-to-r from-[#E8D4A8] via-[#F5E6D3] to-[#9BC4BC] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(232,212,168,0.3)] mr-[0.25em]"
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress indicator - more refined */}
                <motion.div 
                    className="text-center z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <p className="text-[#E8D4A8]/40 text-xs tracking-[0.3em] font-light">
                        {isComplete ? 'ENTERING YOUR SPACE' : `${currentPage + 1} / ${introPages.length}`}
                    </p>
                </motion.div>

                {/* Completion animation - brighter colors */}
                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    rotate: [0, 360],
                                }}
                                transition={{
                                    duration: 2.5,
                                    ease: "easeInOut"
                                }}
                                className="w-16 h-16 rounded-full border-[3px] border-[#E8D4A8] border-t-transparent shadow-[0_0_20px_rgba(232,212,168,0.4)]"
                            />
                            <motion.div
                                animate={{
                                    scale: [1.2, 1.5, 1.2],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute w-24 h-24 rounded-full bg-[#E8D4A8]/10 blur-xl"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}