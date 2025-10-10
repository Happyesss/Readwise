"use client";

import Image from "next/image";
import { isValidImageSrc } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

type SidebarItemProps = {
  label: string;
  iconSrc: string;
  href: string;
};

export const SidebarItem = ({ label, iconSrc, href }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button
      variant={isActive ? "sidebarOutline" : "sidebar"}
      className="h-[52px] justify-start"
      asChild
    >
      <Link href={href}>
        {isValidImageSrc(iconSrc) ? (
          <Image src={iconSrc} alt={label} className="mr-5" height={32} width={32} />
        ) : (
          <div className="mr-5 grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
            {label?.[0]?.toUpperCase()}
          </div>
        )}
        {label}
      </Link>
    </Button>
  );
};
