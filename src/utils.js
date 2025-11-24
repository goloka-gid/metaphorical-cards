// Generate a deck of 120 cards
export const generateDeck = () => {
  return Array.from({ length: 120 }, (_, i) => ({
    id: i + 1,
    content: `Карта ${i + 1}`,
    imageUrl: `/cards/${i + 1}.jpg`,
    color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`
  }));
};
