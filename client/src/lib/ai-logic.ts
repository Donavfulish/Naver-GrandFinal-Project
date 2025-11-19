// Mock AI logic to map user feeling to vibe configuration
export function generateVibeConfig(userFeeling: string) {
  const feelingLower = userFeeling.toLowerCase()

  // Mock mapping logic
  let theme = "rainy_night"
  let music = "lofi_sad"
  let font = "minimal"
  let mood = "Reflective"

  if (feelingLower.includes("happy") || feelingLower.includes("excited")) {
    theme = "sunny_day"
    music = "indie_wave"
    font = "modern"
    mood = "Energetic"
  } else if (feelingLower.includes("stressed") || feelingLower.includes("anxious")) {
    theme = "forest_calm"
    music = "ambient_chill"
    font = "minimal"
    mood = "Grounded"
  } else if (feelingLower.includes("creative") || feelingLower.includes("inspired")) {
    theme = "creative_energy"
    music = "indie_electronic"
    font = "artistic"
    mood = "Creative"
  } else if (feelingLower.includes("tired") || feelingLower.includes("sleepy")) {
    theme = "midnight_calm"
    music = "sleep_ambient"
    font = "elegant"
    mood = "Restful"
  } else if (feelingLower.includes("peaceful") || feelingLower.includes("calm")) {
    theme = "sunset_calm"
    music = "ambient_nature"
    font = "elegant"
    mood = "Serene"
  }

  return {
    theme,
    music,
    font,
    mood,
    colors: {
      primary: "#C7A36B",
      secondary: "#7C9A92",
      accent: "#2A2A2A",
    },
  }
}

// Generate AI insight based on session data
export function generateInsight(
  noteCount: number,
  activeMode: boolean,
  mood: string,
): string {
  if (activeMode) {
    if (noteCount === 0) {
      return `You took a moment to pause and breathe.`
    } else if (noteCount === 1) {
      return `You externalized one important thought.`
    } else if (noteCount <= 3) {
      return `You unloaded ${noteCount} thoughts and feelings.`
    } else {
      return `You captured ${noteCount} thoughts during your session.`
    }
  } else {
    return `You recharged silently and let the ambience guide you.`
  }
}

// Suggest reflection questions based on mood
export function getReflectionQuestion(mood: string): string {
  const questions: Record<string, string> = {
    Reflective: "What's one thing you learned about yourself today?",
    Energetic: "How can you carry this energy into tomorrow?",
    Grounded: "What brought you peace in this moment?",
    Creative: "What inspired you during this session?",
    Restful: "How can you bring more rest into your daily life?",
    Serene: "What does serenity mean to you?",
  }

  return questions[mood] || "What will you take away from this moment?"
}

// Suggested tags based on mood
export function getSuggestedTags(mood: string): string[] {
  const tagMap: Record<string, string[]> = {
    Reflective: ["reflection", "thought", "mindful", "pause"],
    Energetic: ["energy", "inspiration", "movement", "joy"],
    Grounded: ["grounding", "calm", "present", "balance"],
    Creative: ["creative", "inspiration", "idea", "flow"],
    Restful: ["rest", "peace", "sleep", "recovery"],
    Serene: ["peace", "serenity", "calm", "harmony"],
  }

  return tagMap[mood] || ["mindful", "personal"]
}
