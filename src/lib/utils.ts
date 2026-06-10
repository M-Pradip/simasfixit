export function formatMoney(amount: number) {
  const sign = amount < 0 ? "-" : "";
  return `${sign}Rs. ${Math.abs(amount).toLocaleString("en-IN")}`;
}

export function formatNepalDate(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function formatNepalDateTime(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function nepalDateRange(dateFrom?: string, dateTo?: string) {
  const where: { gte?: Date; lte?: Date } = {};

  if (dateFrom) {
    where.gte = new Date(`${dateFrom}T00:00:00+05:45`);
  }

  if (dateTo) {
    where.lte = new Date(`${dateTo}T23:59:59.999+05:45`);
  }

  return Object.keys(where).length ? where : undefined;
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function statusTone(status: string) {
  if (["ACTIVE", "APPROVED", "DELIVERED", "SUPERADMIN"].includes(status)) {
    return "good";
  }

  if (["REJECTED", "SUSPENDED", "CANCELLED"].includes(status)) {
    return "bad";
  }

  if (["PENDING", "REVIEW", "DISPATCHED"].includes(status)) {
    return "warn";
  }

  return "info";
}
