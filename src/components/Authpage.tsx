"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import your existing components
import Register from "@/app/auth/register/page";
import SignIn from "@/app/auth/login/page";

const panelVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  animate: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const direction = isSignUp ? 1 : -1;

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    console.log("Toggling auth mode");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl h-auto min-h-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Animated Background Panel */}
        <motion.div
          className="relative w-1/2 h-full bg-gradient-to-br from-teal-400 to-teal-600 overflow-hidden text-white flex flex-col items-center justify-center p-8"
          initial={{ x: 0 }}
          animate={{ x: isSignUp ? 0 : "100%" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Decorative Shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400 rounded-full translate-x-16 -translate-y-16 opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400 -translate-x-12 translate-y-12 opacity-60"></div>
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-white opacity-10 rotate-45"></div>
          <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-white opacity-20 rounded-full"></div>

          <AnimatePresence mode="wait">
            {isSignUp ? (
              <motion.div
                key="signup-text"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
                <p className="text-center mb-8 opacity-90">
                  Enter your personal details and start your journey with us.
                </p>
                <button
                  onClick={toggleAuthMode}
                  className="border-2 border-white text-white px-8 py-2 rounded-full hover:bg-white hover:text-teal-500 transition-all duration-300 font-medium"
                >
                  SIGN IN
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="signin-text"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-center mb-8 opacity-90">
                  To keep connected with us please login with your personal
                  info.
                </p>
                <button
                  onClick={toggleAuthMode}
                  className="border-2 border-white text-white px-8 py-2 rounded-full hover:bg-white hover:text-teal-500 transition-all duration-300 font-medium"
                >
                  SIGN UP
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Form Panel */}
        <div className="relative w-1/2 h-full overflow-hidden bg-white">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={isSignUp ? "register" : "signin"}
              custom={direction}
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="h-full overflow-y-auto p-8"
            >
              {isSignUp ? (
                <>
                  <p className="mb-4 text-center text-lg font-semibold">
                    Hi there! Ready to join us?
                  </p>
                  <Register />
                </>
              ) : (
                <>
                  <p className="mb-4 text-center text-lg font-semibold">
                    Welcome back! Glad to see you again.
                  </p>
                  <SignIn />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
