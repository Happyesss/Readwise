"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, Lightbulb } from "lucide-react";
import { useAccessibilitySettings } from "@/store/use-accessibility-settings";

interface QuestionContent {
  word?: string;
  words?: string[];
  phonemes?: string[];
  image?: string;
  instruction: string;
  choices: string[];
  audio?: string;
  type?: string;
  position?: string;
}

interface AssessmentQuestionProps {
  question: {
    id: number;
    question_type: string;
    content: QuestionContent;
    difficulty_score: number;
  };
  onAnswerAction: (answer: string) => void;
  showHint?: boolean;
}

export const AssessmentQuestion = ({ question, onAnswerAction, showHint }: AssessmentQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { useTextToSpeech, audioSpeed } = useAccessibilitySettings();

  const content = question.content;

  // Text-to-speech function
  const speak = (text: string) => {
    if (!useTextToSpeech || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = audioSpeed;
    utterance.lang = 'en-US';
    
    setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  };

  // Auto-play instruction on mount
  useEffect(() => {
    if (useTextToSpeech) {
      const timer = setTimeout(() => {
        speak(content.instruction);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [content.instruction, useTextToSpeech]);

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      onAnswerAction(selectedAnswer);
    }
  };

  // Render based on question type
  const renderQuestion = () => {
    switch (question.question_type) {
      case "phoneme_isolation":
        return renderPhonemeIsolation();
      case "blending":
        return renderBlending();
      case "segmentation":
        return renderSegmentation();
      case "rhyme":
        return renderRhyme();
      default:
        return renderDefault();
    }
  };

  const renderPhonemeIsolation = () => (
    <div className="space-y-6">
      {content.image && (
        <div className="flex justify-center">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <span className="text-6xl">{getEmojiForWord(content.word || "")}</span>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">{content.word}</h3>
        <p className="text-muted-foreground">{content.instruction}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {content.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(choice)}
            className={`
              p-6 rounded-xl border-2 text-2xl font-bold transition-all
              ${selectedAnswer === choice 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105" 
                : "border-gray-200 hover:border-gray-300 hover:scale-102"
              }
            `}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );

  const renderBlending = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg text-muted-foreground mb-4">{content.instruction}</p>
        
        {/* Show phonemes */}
        <div className="flex justify-center gap-3 mb-6">
          {content.phonemes?.map((phoneme, index) => (
            <div key={index} className="relative">
              <button
                onClick={() => speak(phoneme)}
                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl text-2xl font-bold hover:scale-110 transition-transform"
              >
                {phoneme}
              </button>
              {index < (content.phonemes?.length || 0) - 1 && (
                <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-2xl">+</span>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="secondary"
          onClick={() => speak(content.phonemes?.join(" ") || "")}
          className="gap-2"
        >
          <Volume2 className="h-5 w-5" />
          Play All Sounds
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {content.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(choice)}
            className={`
              p-6 rounded-xl border-2 text-xl font-bold transition-all
              ${selectedAnswer === choice 
                ? "border-purple-500 bg-purple-50 dark:bg-purple-950 scale-105" 
                : "border-gray-200 hover:border-gray-300"
              }
            `}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSegmentation = () => (
    <div className="space-y-6">
      {content.image && (
        <div className="flex justify-center">
          <div className="w-48 h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
            <span className="text-6xl">{getEmojiForWord(content.word || "")}</span>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-4xl font-bold mb-4">{content.word}</h3>
        <p className="text-lg text-muted-foreground mb-2">{content.instruction}</p>
        
        <Button
          variant="ghost"
          onClick={() => speak(content.word || "")}
          className="gap-2"
        >
          <Volume2 className="h-4 w-4" />
          Hear the word
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {content.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(choice)}
            className={`
              p-8 rounded-xl border-2 text-3xl font-bold transition-all
              ${selectedAnswer === choice 
                ? "border-green-500 bg-green-50 dark:bg-green-950 scale-105" 
                : "border-gray-200 hover:border-gray-300"
              }
            `}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );

  const renderRhyme = () => {
    const isYesNo = content.type === "yes_no";
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">{content.instruction}</p>
          
          {content.words && (
            <div className="flex justify-center gap-6 mb-6">
              {content.words.map((word, index) => (
                <div key={index} className="space-y-2">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center">
                    <span className="text-5xl">{getEmojiForWord(word)}</span>
                  </div>
                  <p className="text-2xl font-bold">{word}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speak(word)}
                    className="gap-1"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {content.word && (
            <div className="mb-6">
              <h3 className="text-4xl font-bold mb-2">{content.word}</h3>
              <Button
                variant="ghost"
                onClick={() => speak(content.word || "")}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Hear the word
              </Button>
            </div>
          )}
        </div>

        <div className={`grid ${isYesNo ? 'grid-cols-2' : 'grid-cols-2'} gap-4`}>
          {content.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(choice)}
              className={`
                p-6 rounded-xl border-2 text-xl font-bold transition-all
                ${selectedAnswer === choice 
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950 scale-105" 
                  : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderDefault = () => (
    <div className="space-y-6">
      <p className="text-lg text-center">{content.instruction}</p>
      <div className="grid grid-cols-2 gap-4">
        {content.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(choice)}
            className={`
              p-6 rounded-xl border-2 text-xl font-bold transition-all
              ${selectedAnswer === choice 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                : "border-gray-200 hover:border-gray-300"
              }
            `}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-8">
        {/* Audio playback button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-muted-foreground">
              {isPlaying ? "Playing..." : "Ready"}
            </span>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => speak(content.instruction)}
            className="gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Repeat Instructions
          </Button>
        </div>

        {/* Question Content */}
        {renderQuestion()}

        {/* Hint (if enabled) */}
        {showHint && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Hint:</strong> Take your time and listen carefully to each sound.
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full mt-6"
          size="lg"
        >
          Submit Answer
        </Button>
      </CardContent>
    </Card>
  );
};

// Helper function to get emoji for common words
function getEmojiForWord(word: string): string {
  const emojiMap: Record<string, string> = {
    cat: "🐱", dog: "🐕", fish: "🐟", sun: "☀️", map: "🗺️",
    bat: "🦇", ring: "💍", top: "🔝", leg: "🦵", van: "🚐",
    bus: "🚌", bed: "🛏️", big: "📏", cup: "☕", pen: "🖊️",
    ham: "🍖", fox: "🦊", car: "🚗", ball: "⚽", shop: "🏪",
    black: "⚫", jump: "🤸", stand: "🧍", bring: "📦", strong: "💪",
    splash: "💦", spring: "🌸", stretch: "🤸", blanket: "🛏️", cricket: "🦗",
    trampoline: "🤸", tree: "🌳", snake: "🐍", moon: "🌙", star: "⭐",
    cloud: "☁️",
  };
  
  return emojiMap[word.toLowerCase()] || "📝";
}
