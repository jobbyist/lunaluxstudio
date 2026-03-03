import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Array of 15 inspirational quotes about women for International Women's Month
const INSPIRATIONAL_QUOTES = [
  "A woman is the full circle. Within her is the power to create, nurture and transform.",
  "The question isn't who's going to let me; it's who's going to stop me.",
  "There is no limit to what we, as women, can accomplish.",
  "A strong woman looks a challenge in the eye and gives it a wink.",
  "She believed she could, so she did.",
  "Women are the real architects of society.",
  "Empowered women empower women.",
  "A woman with a voice is, by definition, a strong woman.",
  "The future is female.",
  "Well-behaved women seldom make history.",
  "A girl should be two things: who and what she wants.",
  "I am woman, phenomenally. Phenomenal woman, that's me.",
  "The most courageous act is still to think for yourself. Aloud.",
  "Women belong in all places where decisions are being made.",
  "She is clothed in strength and dignity, and she laughs without fear of the future."
];

const PRELOADER_SESSION_KEY = "lunastudio_preloader_shown";

export const Preloader = () => {
  // Preloader is disabled
  return null;
};
