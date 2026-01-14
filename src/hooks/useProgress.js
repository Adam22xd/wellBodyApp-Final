export default function useProgress() {
  const getProgress = (current, limit) => {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  return { getProgress };
}
