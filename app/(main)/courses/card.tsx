import { Check, BookOpen, Brain, Zap, Sparkles, BookMarked } from "lucide-react";
import Image from "next/image";

import { cn, isValidImageSrc } from "@/lib/utils";

type CardProps = {
  title: string;
  id: number;
  imageSrc: string;
  onClick: (id: number) => void;
  disabled?: boolean;
  isActive?: boolean;
};

export const Card = ({
  title,
  id,
  imageSrc,
  onClick,
  disabled,
  isActive,
}: CardProps) => {
  const iconMap: Record<
    string,
    {
      Icon: typeof BookOpen;
      gradient: string;
    }
  > = {
    "book-marked": { Icon: BookMarked, gradient: "from-blue-400 to-indigo-500" },
    "book-open": { Icon: BookOpen, gradient: "from-green-400 to-emerald-500" },
    brain: { Icon: Brain, gradient: "from-purple-400 to-pink-500" },
    zap: { Icon: Zap, gradient: "from-yellow-400 to-orange-500" },
    sparkles: { Icon: Sparkles, gradient: "from-rose-400 to-red-500" },
  };

  // Function to render icon based on imageSrc
  const renderIcon = () => {
    const normalized = imageSrc?.trim().toLowerCase();
    const iconConfig = normalized ? iconMap[normalized] : null;

    if (iconConfig) {
      const { Icon, gradient } = iconConfig;

      return (
        <div
          className={cn(
            "flex h-[70px] w-[93.33px] items-center justify-center rounded-lg border bg-gradient-to-br p-4 shadow-md",
            gradient
          )}
        >
          <Icon className="h-12 w-12 text-white" strokeWidth={2.5} />
        </div>
      );
    }

    const isIconName = normalized && !normalized.includes("/") && !normalized.includes(".");

    if (isIconName) {
      const FallbackIcon = BookOpen;
      const fallbackGradient = "from-blue-400 to-indigo-500";

      return (
        <div className={`flex h-[70px] w-[93.33px] items-center justify-center rounded-lg border bg-gradient-to-br ${fallbackGradient} p-4 shadow-md`}>
          <FallbackIcon className="h-12 w-12 text-white" strokeWidth={2.5} />
        </div>
      );
    }

    // only pass valid image src values to next/image
    if (isValidImageSrc(imageSrc)) {
      return (
        <Image
          src={imageSrc}
          alt={title}
          height={70}
          width={93.33}
          className="rounded-lg border object-cover drop-shadow-md"
        />
      );
    }

    // if the src is not a valid image url (for example an icon name like
    // "book-marked"), fall back to the default lucide icon rendering above
    const FallbackIcon = BookOpen;
    const fallbackGradient = "from-blue-400 to-indigo-500";

    return (
      <div className={`flex h-[70px] w-[93.33px] items-center justify-center rounded-lg border bg-gradient-to-br ${fallbackGradient} p-4 shadow-md`}>
        <FallbackIcon className="h-12 w-12 text-white" strokeWidth={2.5} />
      </div>
    );
  };

  return (
    <div
      onClick={() => onClick(id)}
      className={cn(
        "flex h-full min-h-[217px] min-w-[200px] cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-b-[4px] p-3 pb-6 hover:bg-black/5 active:border-b-2",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="flex min-h-[24px] w-full items-center justify-end">
        {isActive && (
          <div className="flex items-center justify-center rounded-md bg-purple-600 p-1.5">
            <Check className="h-4 w-4 stroke-[4] text-white" />
          </div>
        )}
      </div>

      {/* Icon or Image */}
      {renderIcon()}

      <p className="mt-3 text-center font-bold text-neutral-700">{title}</p>
    </div>
  );
};
