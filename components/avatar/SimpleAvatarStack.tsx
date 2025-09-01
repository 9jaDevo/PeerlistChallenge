"use client";

import { motion, useSpring } from "framer-motion";
import { useState, forwardRef } from "react";
import { PersonaMode, usePersona } from "../../lib/store";

// Simplified Avatar data interface
export interface Avatar {
  id: string;
  name: string;
  role: string;
  image: string;
  color: string;
}

interface SimpleAvatarStackProps {
  avatars: Avatar[];
  className?: string;
}

export function SimpleAvatarStack({ 
  avatars, 
  className = ""
}: SimpleAvatarStackProps) {
  const { mode } = usePersona();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  console.log('Current mode:', mode, 'Hovered index:', hoveredIndex);

  return (
    <div className={`relative ${className}`}>
      {/* Mode indicator */}
      <div className="text-center mb-6">
        <p className="text-white">Current mode: {mode}</p>
        <p className="text-gray-400">Hovered: {hoveredIndex !== null ? avatars[hoveredIndex]?.name : 'None'}</p>
      </div>

      {/* Avatar Stack */}
      <div className="flex items-center justify-center gap-4 p-12 relative">
        {avatars.map((avatar, index) => (
          <SimpleAvatar
            key={avatar.id}
            avatar={avatar}
            index={index}
            isHovered={hoveredIndex === index}
            onMouseEnter={() => {
              console.log('Mouse enter:', avatar.name);
              setHoveredIndex(index);
            }}
            onMouseLeave={() => {
              console.log('Mouse leave:', avatar.name);
              setHoveredIndex(null);
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface SimpleAvatarProps {
  avatar: Avatar;
  index: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SimpleAvatar = ({ avatar, index, isHovered, onMouseEnter, onMouseLeave }: SimpleAvatarProps) => {
  const scale = useSpring(isHovered ? 1.3 : 1, { stiffness: 300, damping: 30 });
  const y = useSpring(isHovered ? -20 : 0, { stiffness: 300, damping: 30 });

  return (
    <motion.div
      className={`
        w-20 h-20 rounded-full overflow-hidden cursor-pointer
        border-2 transition-colors duration-200
        ${isHovered ? 'border-purple-400' : 'border-gray-600'}
      `}
      style={{
        scale,
        y,
        backgroundImage: `url(${avatar.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: avatar.color
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isHovered && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✨</span>
        </div>
      )}
    </motion.div>
  );
};