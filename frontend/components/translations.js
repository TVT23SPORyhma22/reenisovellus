export const fetchExerciseTranslations = async (languageCode) => {
  try {
    const limit = 20;
    const startOffset = 0;
    const endOffset = 1650;
    let translations = {};

    const urls = [];
    for (let offset = startOffset; offset <= endOffset; offset += limit) {
      urls.push(`https://wger.de/api/v2/exercise-translation/?language=${languageCode}&limit=${limit}&offset=${offset}`);
    }
    const responses = await Promise.all(urls.map(url => fetch(url).then(res => res.json())));

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
    return {};
  }
};
