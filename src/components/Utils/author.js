export const authorLabel = (trail, t) =>
  trail.authorDeleted ? t("author.deletedProfile") : trail.authorName || "";