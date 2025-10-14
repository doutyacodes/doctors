// RIASEC Calculation Logic
// Based on Holland Code Career Test

export const calculateRIASEC = (answersArray, riasecTypes) => {
  console.log('calculateRIASEC called with:', JSON.stringify({ answersArray, riasecTypes }, null, 2));

  // Initialize scores for each personality type
  const scores = {};
  riasecTypes.forEach(type => {
    scores[type.typeCode] = 0;
  });

  console.log('Initial scores:', scores);

  // Calculate scores based on responses
  answersArray.forEach(answer => {
    const { personalityTypeId, optionId, scoreValue } = answer;

    // Find the type code for this personality type ID
    const type = riasecTypes.find(t => t.id === personalityTypeId);

    if (type) {
      // Add the score value from the selected option
      scores[type.typeCode] += scoreValue;
      console.log(`Adding ${scoreValue} to ${type.typeCode}, new score: ${scores[type.typeCode]}`);
    }
  });

  console.log('Scores after calculation:', scores);

  // Sort scores from highest to lowest
  const sortedScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]); // Sort by score descending

  console.log('Sorted scores:', sortedScores);

  // Get top 3 types (handling ties)
  let topTypes = [];
  let includedCount = 0;
  let lastIncludedScore = null;

  for (const [typeCode, score] of sortedScores) {
    // If we already have 3 types AND this score is different from the last included one
    if (includedCount >= 3 && score !== lastIncludedScore) {
      break;
    }

    // Add this type
    topTypes.push(typeCode);
    lastIncludedScore = score;
    includedCount++;
  }

  // Join the top 3 to form the RIASEC code
  const topThree = topTypes.slice(0, 3).join('');

  // Create full RIASEC code (all 6 in order)
  const riasecCode = sortedScores.map(([code]) => code).join('');

  console.log('Top three:', topThree);
  console.log('Full RIASEC code:', riasecCode);

  // Calculate percentages for each type (out of max possible score)
  const maxScorePerType = 10; // 5 questions × 2 points max
  const percentages = {};
  Object.entries(scores).forEach(([typeCode, score]) => {
    percentages[typeCode] = Math.round((score / maxScorePerType) * 100);
  });

  const result = {
    topThree,
    riasecCode,
    scores,
    percentages,
  };

  console.log('Final RIASEC result:', JSON.stringify(result, null, 2));

  return result;
};

// Generate a unique test token
export const generateTestToken = () => {
  return `riasec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Calculate token expiration (default: 7 days)
export const getTokenExpiration = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
