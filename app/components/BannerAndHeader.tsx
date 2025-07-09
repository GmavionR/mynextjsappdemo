"use client";
import { Search, MoreHorizontal } from "lucide-react";
import Image from "next/image";

interface BannerAndHeaderProps {
  onSearchClick: () => void;
}

const BannerAndHeader = ({ onSearchClick }: BannerAndHeaderProps) => (
  <div className="relative">
    <Image
      src="/20250707_185154.jpg"
      alt="Restaurant Banner"
      width={500}
      height={250}
      className="w-full h-48 md:h-64 object-cover"
    />
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-center bg-gradient-to-b from-black/50 to-transparent">
      <div className="flex items-center space-x-2 md:space-x-3">
        <button
          onClick={onSearchClick}
          className="text-white bg-black/30 rounded-full p-1"
        >
          <Search size={20} />
        </button>
        <button className="text-white bg-black/30 rounded-full p-1">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  </div>
);

export default BannerAndHeader;
