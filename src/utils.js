// Generate a deck of 120 cards
export const generateDeck = () => {
  // Use import.meta.env.BASE_URL to handle deployment in subdirectories (like GitHub Pages)
  const baseUrl = import.meta.env.BASE_URL;

  return Array.from({ length: 120 }, (_, i) => ({
    id: i + 1,
    content: `Карта ${i + 1}`,
    // Remove the leading slash so it's relative to the base path
    imageUrl: `${baseUrl}cards/${i + 1}.jpg`, 
    color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`
  }));
};
