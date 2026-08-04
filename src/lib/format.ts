export function formatPrice(amount: number) {
  const withDots = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots} FCFA`;
}