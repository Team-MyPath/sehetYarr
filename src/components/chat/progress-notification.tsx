"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressNotificationProps {
  message: string;
  isVisible: boolean;
}

export function ProgressNotification({
  message,
  isVisible,
}: ProgressNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AnimatePresence mode='wait'>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className='fixed top-24 right-6 z-50 max-w-sm'
        >
          <motion.div
            layout
            transition={{
              layout: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
            }}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 backdrop-blur-sm shadow-lg",
              "transition-all duration-300 ease-out",
              isExpanded ? "w-96" : "w-auto"
            )}
          >
            {/* Content */}
            <div className='relative'>
              {/* Header - Always visible, clickable to expand/collapse */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "flex w-full items-center gap-3 p-3.5 transition-colors",
                  "focus:outline-none focus:ring-offset-0 rounded-xl",
                  !isExpanded && "pr-5"
                )}
              >
                {/* Animated spinner icon */}
                {/* <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex-shrink-0"
                >
                  <Loader2 className="h-5 w-5 text-white" />
                </motion.div> */}
                <div className='flex items-center gap-1.5'>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                      className='h-1.5 w-1.5 rounded-full bg-neutral-300'
                    />
                  ))}
                </div>

                {/* Status text when collapsed */}
                {!isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='text-sm font-medium text-neutral-300 whitespace-nowrap'
                  >
                    Processing...
                  </motion.span>
                )}

                {/* Expand/Collapse indicator */}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                  className='ml-auto flex-shrink-0'
                >
                  {isExpanded ? (
                    <ChevronUp className='h-4 w-4 text-neutral-300' />
                  ) : (
                    <ChevronDown className='h-4 w-4 text-neutral-300' />
                  )}
                </motion.div>
              </button>

              {/* Expanded content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      transition: {
                        height: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
                        opacity: { duration: 0.25, delay: 0.1 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
                        opacity: { duration: 0.15 },
                      },
                    }}
                    className='overflow-hidden'
                  >
                    <div className='px-4 pb-4 pt-3'>
                      {/* Progress message with animated dots */}
                      <div className='flex items-start gap-2'>
                        <div className='flex-1'>
                          <p className='text-sm text-neutral-100 leading-relaxed'>
                            {message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subtle shimmer effect */}
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1.5,
              }}
              className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none'
              style={{ width: "30%" }}
            />
          </motion.div>

          {/* Minimal shadow */}
          <div className='absolute inset-0 -z-10 rounded-xl bg-white/10 blur-xl' />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
