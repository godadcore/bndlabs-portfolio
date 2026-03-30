import groq from "groq";

export const publishedProjectsQuery = groq`*[_type == "caseStudy"] | order(coalesce(publishedDate, _createdAt) desc, _createdAt desc, title asc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  category,
  publishedDate,
  status,
  liveUrl,
  prototypeUrl,
  twitterUrl,
  whatsappNumber,
  "brandLogo": {
    "url": brandLogo.asset->url
  },
  "heroImage": {
    "url": heroImage.asset->url
  },
  overview,
  stats[]{
    value,
    label
  },
  role,
  tools,
  timeline,
  researchImages[]{
    alt,
    caption,
    "url": image.asset->url
  },
  wireframeImages[]{
    alt,
    caption,
    "url": image.asset->url
  },
  prototypeImages[]{
    alt,
    caption,
    "url": image.asset->url
  },
  results[]{
    metric,
    description
  },
  finalGallery[]{
    alt,
    caption,
    "url": image.asset->url
  }
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"] | order(_updatedAt desc)[0] {
  ...
}`;
