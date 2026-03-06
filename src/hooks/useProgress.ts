export default function useProgress() {
  const getProgress = (current: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  return { getProgress };
}
