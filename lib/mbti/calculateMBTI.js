// MBTI Calculation Logic
// Based on the createSequence logic from the reference project

export const calculateMBTI = (answersArray) => {
  console.log('calculateMBTI called with:', JSON.stringify(answersArray, null, 2));

  // Define which questions belong to each MBTI dimension
  const dimensions = {
    EI: [1, 2, 3], // Questions for Extraversion/Introversion
    SN: [4, 5, 6], // Questions for Sensing/Intuition
    TF: [7, 8, 9], // Questions for Thinking/Feeling
    JP: [10, 11, 12], // Questions for Judging/Perceiving
  };

  // Map analytic IDs to MBTI letters
  const letterMap = {
    1: 'E', // Extraversion
    2: 'I', // Introversion
    3: 'S', // Sensing
    4: 'N', // Intuition
    5: 'T', // Thinking
    6: 'F', // Feeling
    7: 'J', // Judging
    8: 'P', // Perceiving
  };

  // Function to get analytic IDs for a given dimension
  const getAnalyticIds = (answers, questionIds) => {
    return answers
      .filter((answer) => questionIds.includes(answer.questionId))
      .map((answer) => answer.analyticId);
  };

  // Get analytic IDs for each dimension
  const dimensionAnalytics = {
    EI: getAnalyticIds(answersArray, dimensions.EI),
    SN: getAnalyticIds(answersArray, dimensions.SN),
    TF: getAnalyticIds(answersArray, dimensions.TF),
    JP: getAnalyticIds(answersArray, dimensions.JP),
  };

  // Function to get the most frequent letter in a dimension
  const getMostFrequentLetter = (analyticIds) => {
    const frequency = new Map();

    analyticIds.forEach((id) => {
      const letter = letterMap[id];
      if (letter) {
        frequency.set(letter, (frequency.get(letter) || 0) + 1);
      }
    });

    let mostFrequentLetter = '';
    let maxCount = 0;

    frequency.forEach((count, letter) => {
      if (count > maxCount) {
        mostFrequentLetter = letter;
        maxCount = count;
      }
    });

    return mostFrequentLetter;
  };

  // Calculate the most frequent letter for each dimension
  const result = {
    EI: getMostFrequentLetter(dimensionAnalytics.EI),
    SN: getMostFrequentLetter(dimensionAnalytics.SN),
    TF: getMostFrequentLetter(dimensionAnalytics.TF),
    JP: getMostFrequentLetter(dimensionAnalytics.JP),
  };

  // Combine to form the personality type
  const personalityType = `${result.EI}${result.SN}${result.TF}${result.JP}`;

  console.log('Calculated personality type:', personalityType);
  console.log('Dimension results:', result);

  // Calculate percentage scores for each dimension
  const calculatePercentage = (analyticIds, letter1, letter2) => {
    const id1 = Object.keys(letterMap).find((key) => letterMap[key] === letter1);
    const id2 = Object.keys(letterMap).find((key) => letterMap[key] === letter2);

    const count1 = analyticIds.filter((id) => id === parseInt(id1)).length;
    const count2 = analyticIds.filter((id) => id === parseInt(id2)).length;
    const total = count1 + count2;

    return {
      [letter1]: total > 0 ? Math.round((count1 / total) * 100) : 0,
      [letter2]: total > 0 ? Math.round((count2 / total) * 100) : 0,
    };
  };

  const dimensionScores = {
    EI: calculatePercentage(dimensionAnalytics.EI, 'E', 'I'),
    SN: calculatePercentage(dimensionAnalytics.SN, 'S', 'N'),
    TF: calculatePercentage(dimensionAnalytics.TF, 'T', 'F'),
    JP: calculatePercentage(dimensionAnalytics.JP, 'J', 'P'),
  };

  console.log('Dimension scores:', JSON.stringify(dimensionScores, null, 2));

  const finalResult = {
    personalityType,
    dimensions: result,
    dimensionScores,
  };

  console.log('Final MBTI result:', JSON.stringify(finalResult, null, 2));

  return finalResult;
};

// Generate a unique test token
export const generateTestToken = () => {
  return `mbti_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Calculate token expiration (default: 7 days)
export const getTokenExpiration = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
