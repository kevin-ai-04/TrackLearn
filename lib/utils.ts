export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function normalizeRouteSegment(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function formatDateTime(dateString: string | null) {
  if (!dateString) {
    return "Not yet visited";
  }

  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatContentStatus(status: string) {
  switch (status) {
    case "draft":
    case "changes_requested":
      return "private";
    case "pending_review":
      return "pending approval";
    case "published":
      return "public";
    default:
      return status.replaceAll("_", " ");
  }
}
