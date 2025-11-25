// Generate a deck of cards from a specific folder
export const generateDeck = (folderPath = 'cards', count = 120) => {
  const baseUrl = import.meta.env.BASE_URL;
  
  // Clean up folderPath to avoid double slashes if user passes 'cards/'
  const cleanPath = folderPath.endsWith('/') ? folderPath.slice(0, -1) : folderPath;
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    content: `Карта ${i + 1}`,
    imageUrl: `${baseUrl}${cleanPath}/${i + 1}.jpg`, 
    color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`
  }));
};
