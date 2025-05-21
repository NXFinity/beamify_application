import React from "react";

export interface GamifyCardProps {
  gamify: {
    points: number;
    level: number;
    exp: number;
    crystals: number;
  };
}

const GamifyCard: React.FC<GamifyCardProps> = ({ gamify }) => {
  return (
    <div className="flex items-center gap-4 bg-gray-900 px-4 py-2">
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400">Points</span>
        <span className="font-bold text-lg text-orange-400">{gamify.points}</span>
      </div>
      <div className="h-8 border-l border-gray-700 mx-2" />
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400">Level</span>
        <span className="font-bold text-lg text-blue-400">{gamify.level}</span>
      </div>
      <div className="h-8 border-l border-gray-700 mx-2" />
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400">Exp</span>
        <span className="font-bold text-lg text-green-400">{gamify.exp}</span>
      </div>
      <div className="h-8 border-l border-gray-700 mx-2" />
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400">Crystals</span>
        <span className="font-bold text-lg text-cyan-300">{gamify.crystals}</span>
      </div>
    </div>
  );
};

export default GamifyCard;
