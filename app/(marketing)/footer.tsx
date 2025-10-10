import { Brain, BookOpen, Sparkles, Target, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <div className="hidden h-20 w-full border-t-2 border-slate-200 p-2 lg:block">
      <div className="mx-auto flex h-full max-w-screen-lg items-center justify-evenly">
        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Brain className="mr-3 h-6 w-6 text-blue-500" />
          Phonics
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <BookOpen className="mr-3 h-6 w-6 text-green-500" />
          Reading
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Sparkles className="mr-3 h-6 w-6 text-purple-500" />
          Sight Words
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Target className="mr-3 h-6 w-6 text-orange-500" />
          Comprehension
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Zap className="mr-3 h-6 w-6 text-yellow-500" />
          Fluency
        </Button>
      </div>
    </div>
  );
};
