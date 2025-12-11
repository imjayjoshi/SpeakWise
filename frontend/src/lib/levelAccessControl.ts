import { Level } from "./api";

const LEVEL_HIERARCHY: Record<Level, number> = {
  beginner: 1,
  intermediate: 2,
  expert: 3,
};

export const isLevelAccessible = (
  requestedLevel: Level,
  userLevel: Level
): boolean => {
  const requestedRank = LEVEL_HIERARCHY[requestedLevel];
  const userRank = LEVEL_HIERARCHY[userLevel];
  
  // Users can access levels up to and including their current level
  return requestedRank <= userRank;
};

export const getAccessibleLevels = (userLevel: Level): Level[] => {
  const userRank = LEVEL_HIERARCHY[userLevel];
  const allLevels: Level[] = ["beginner", "intermediate", "expert"];
  
  return allLevels.filter((level) => LEVEL_HIERARCHY[level] <= userRank);
};

export const getLockedLevelMessage = (
  level: Level,
  userLevel: Level
): string => {
  if (userLevel === "beginner") {
    return `Complete beginner level to unlock ${level} phrases`;
  }
  if (userLevel === "intermediate" && level === "expert") {
    return "Complete intermediate level to unlock expert phrases";
  }
  return `Upgrade your level to access ${level} phrases`;
};
