export const fetchExerciseTranslations = async (languageCode) => {
  try {
    const limit = 20; // Number of items per page
    const startOffset = 0; // Starting offset
    const endOffset = 1650; // Ending offset
    let translations = {}; // To store the final translations

    // Generate URLs from start to end offset
    const urls = [];
    for (let offset = startOffset; offset <= endOffset; offset += limit) {
      // Create the URLs for paginated requests
      urls.push(`https://wger.de/api/v2/exercise-translation/?language=${languageCode}&limit=${limit}&offset=${offset}`);
    }

    // Fetch all pages concurrently
    const responses = await Promise.all(urls.map(url => fetch(url).then(res => res.json())));

    // Flatten all results into one array
    const allTranslations = responses.reduce((acc, data) => {
      acc.push(...data.results);
      return acc;
    }, []);
    allTranslations.forEach(translation => {
      if (translation.language === 2 && translation.name?.trim()) {
        translations[translation.exercise] = translation.name;
      }

    });

    return translations;
  } catch (error) {
    console.error("Error fetching translations:", error);
    return {}; // Return an empty object in case of error
  }
};
