import React from "react";
import { Award, Shield, Star, Zap, Crown, Trophy } from "lucide-react";

interface Badge {
  id: string;
  badge: {
    code: string;
    name: string;
    description: string;
    category: string;
    rarity: string;
    iconUrl: string | null;
    color: string | null;
  };
  awardedAt: string;
  isDisplayed: boolean;
}

interface BadgeDisplayProps {
  badges: Badge[];
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  maxDisplay?: number;
}

const RARITY_CONFIG: Record<string, { bg: string; border: string; glow: string }> = {
  COMMON: { bg: "bg-gray-100", border: "border-gray-300", glow: "" },
  UNCOMMON: { bg: "bg-green-100", border: "border-green-400", glow: "" },
  RARE: { bg: "bg-blue-100", border: "border-blue-500", glow: "shadow-blue-200" },
  EPIC: { bg: "bg-purple-100", border: "border-purple-500", glow: "shadow-purple-200" },
  LEGENDARY: { bg: "bg-yellow-100", border: "border-yellow-500", glow: "shadow-yellow-200 animate-pulse" },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  VERIFICATION: Shield,
  TRANSACTION: Zap,
  TRUST: Star,
  ENGAGEMENT: Award,
  ACHIEVEMENT: Trophy,
  SPECIAL: Crown,
};

const SIZE_CONFIG = {
  sm: { container: "h-6 w-6", icon: "h-3 w-3", text: "text-xs" },
  md: { container: "h-8 w-8", icon: "h-4 w-4", text: "text-sm" },
  lg: { container: "h-12 w-12", icon: "h-6 w-6", text: "text-base" },
};

export default function BadgeDisplay({
  badges,
  size = "md",
  showTooltip = true,
  maxDisplay = 5,
}: BadgeDisplayProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;
  const sizeConfig = SIZE_CONFIG[size];

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {displayBadges.map((userBadge) => {
        const rarityConfig = RARITY_CONFIG[userBadge.badge.rarity] || RARITY_CONFIG.COMMON;
        const IconComponent = CATEGORY_ICONS[userBadge.badge.category] || Award;

        return (
          <div key={userBadge.id} className="relative group">
            <div
              className={`
                ${sizeConfig.container} 
                ${rarityConfig.bg} 
                ${rarityConfig.glow}
                border-2 ${rarityConfig.border}
                rounded-full flex items-center justify-center
                transition-transform hover:scale-110 cursor-pointer
                shadow-sm
              `}
              style={{
                backgroundColor: userBadge.badge.color
                  ? `${userBadge.badge.color}20`
                  : undefined,
                borderColor: userBadge.badge.color || undefined,
              }}
            >
              {userBadge.badge.iconUrl ? (
                <img
                  src={userBadge.badge.iconUrl}
                  alt={userBadge.badge.name}
                  className={sizeConfig.icon}
                />
              ) : (
                <IconComponent
                  className={sizeConfig.icon}
                  style={{ color: userBadge.badge.color || undefined }}
                />
              )}
            </div>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 whitespace-nowrap z-50" aria-hidden="true">
                <div className="font-semibold">{userBadge.badge.name}</div>
                <div className="text-gray-300">{userBadge.badge.description}</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" aria-hidden="true"></div>
              </div>
            )}
          </div>
        );
      })}

      {remainingCount > 0 && (
        <div
          className={`
            ${sizeConfig.container} 
            bg-gray-100 border-2 border-gray-300
            rounded-full flex items-center justify-center
            ${sizeConfig.text} font-medium text-gray-600
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// Badge Card Component for full display
export function BadgeCard({ badge, showDetails = true }: { badge: Badge; showDetails?: boolean }) {
  const rarityConfig = RARITY_CONFIG[badge.badge.rarity] || RARITY_CONFIG.COMMON;
  const IconComponent = CATEGORY_ICONS[badge.badge.category] || Award;

  return (
    <div
      className={`
        p-4 rounded-xl border-2 ${rarityConfig.border} ${rarityConfig.bg}
        ${rarityConfig.glow ? `shadow-lg ${rarityConfig.glow}` : ""}
        transition-all hover:shadow-md
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: badge.badge.color ? `${badge.badge.color}30` : "white",
          }}
        >
          {badge.badge.iconUrl ? (
            <img src={badge.badge.iconUrl} alt={badge.badge.name} className="h-8 w-8" />
          ) : (
            <IconComponent
              className="h-8 w-8"
              style={{ color: badge.badge.color || "#6B7280" }}
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{badge.badge.name}</h3>
          {showDetails && (
            <>
              <p className="text-sm text-gray-600 mt-1">{badge.badge.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    badge.badge.rarity === "LEGENDARY"
                      ? "bg-yellow-200 text-yellow-800"
                      : badge.badge.rarity === "EPIC"
                      ? "bg-purple-200 text-purple-800"
                      : badge.badge.rarity === "RARE"
                      ? "bg-blue-200 text-blue-800"
                      : badge.badge.rarity === "UNCOMMON"
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {badge.badge.rarity}
                </span>
                <span className="text-xs text-gray-500">
                  Diperoleh {new Date(badge.awardedAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Reputation Level Component
export function ReputationLevel({
  level,
  rank,
  currentXp,
  xpToNextLevel,
}: {
  level: number;
  rank: string;
  currentXp: number;
  xpToNextLevel: number;
}) {
  const progress = xpToNextLevel > 0 ? ((currentXp / (currentXp + xpToNextLevel)) * 100) : 100;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">{level}</span>
          </div>
          <div>
            <div className="font-semibold">{rank}</div>
            <div className="text-sm text-white/80">Level {level}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/80">XP</div>
          <div className="font-semibold">{currentXp.toLocaleString()}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-white/80 mb-1">
          <span>Progress ke Level {level + 1}</span>
          <span>{xpToNextLevel.toLocaleString()} XP lagi</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
