/**
 * Convert một ISO datetime string thành thời gian tương đối.
 * 
 * Ví dụ input: "2025-12-01T14:32:45.140+00:00"
 *
 * Quy tắc trả về:
 *  - < 60 giây  → "Vừa xong"
 *  - < 60 phút → "x phút trước"
 *  - < 24 giờ  → "x giờ trước"
 *  - < 7 ngày  → "x ngày trước"
 *  - ≥ 7 ngày  → "dd/MM/yyyy"
 *
 * @param isoTime Chuỗi thời gian ISO (UTC hoặc timezone bất kỳ)
 * @returns Chuỗi thời gian đã format thân thiện với người dùng
 */
export const getRelativeTimeFromISO = (isoTime: string): string => {
  const now = new Date();
  const time = new Date(isoTime);

  const diffMs = now.getTime() - time.getTime();
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
