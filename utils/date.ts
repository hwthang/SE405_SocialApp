export const getRelativeTimeFromISO = (isoTime: string): string => {
  const time = new Date(isoTime);

  // ISO không hợp lệ
  if (isNaN(time.getTime())) return "";

  const now = Date.now();
  let diffMs = now - time.getTime();

  // Trường hợp time ở tương lai
  if (diffMs < 0) diffMs = 0;

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;

  // format dd/MM/yyyy
  const d = time.getDate().toString().padStart(2, "0");
  const m = (time.getMonth() + 1).toString().padStart(2, "0");
  const y = time.getFullYear();

  return `${d}/${m}/${y}`;
};
