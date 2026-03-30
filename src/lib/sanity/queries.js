import groq from "groq";

export const publishedCaseStudiesQuery = groq`*[_type == "caseStudy"] | order(coalesce(publishedDate, date, _createdAt) desc, _createdAt desc, title asc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  category,
  publishedDate,
  date,
  status,
  liveUrl,
  liveProjectUrl,
  prototypeUrl,
  twitterUrl,
  whatsappNumber,
  client,
  industry,
  nextSteps,
  tasks,
  tags,
  "brandLogo": {
    "url": brandLogo.asset->url
  },
  "heroImage": {
    "url": heroImage.asset->url
  },
  images[]{
    alt,
    caption,
    "url": image.asset->url
  },
  sections[]{
    _key,
    _type,
    title,
    body,
    alt,
    caption,
    columns,
    rows[]{
      cells
    },
    "image": {
      "url": image.asset->url,
      "alt": alt,
      "caption": caption
    },
    "poster": {
      "url": poster.asset->url
    },
    "video": {
      "url": video.asset->url
    },
    "audio": {
      "url": audio.asset->url
    },
    frames[]{
      alt,
      caption,
      "url": image.asset->url
    }
  },
  overview,
  stats[]{
    value,
    label
  },
  role,
  tools,
  timeline,
  objectives[]{
    title,
    text,
    status
  },
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

export const publishedLegacyProjectsQuery = groq`*[_type == "project"] | order(coalesce(date, _createdAt) desc, _createdAt desc, title asc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  ...,
  "slug": slug.current
}`;

export const publishedProjectsQuery = publishedCaseStudiesQuery;

export const publishedPostsQuery = groq`*[_type == "post"] | order(coalesce(date, _createdAt) desc, _createdAt desc, title asc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  "slug": coalesce(slug.current, slug),
  excerpt,
  date,
  read_time,
  tag,
  thumb_url,
  "thumbnail": coalesce(
    thumb_url,
    mainImage.asset->url,
    mainImage.url,
    thumbnail.asset->url,
    thumbnail.url,
    image.asset->url,
    image.url,
    heroImage.asset->url,
    heroImage.url
  ),
  author{
    name,
    initials,
    avatar_url
  },
  content_blocks[]{
    ...,
    _type,
    "url": coalesce(url, src, image.asset->url, image.url, asset->url),
    images[]{
      ...,
      "url": coalesce(url, src, image.asset->url, image.url, asset->url)
    }
  },
  next_post{
    title,
    "slug": coalesce(slug.current, slug),
    excerpt,
    date,
    read_time,
    tag,
    thumb_url,
    "thumbnail": coalesce(
      thumb_url,
      mainImage.asset->url,
      mainImage.url,
      thumbnail.asset->url,
      thumbnail.url,
      image.asset->url,
      image.url,
      heroImage.asset->url,
      heroImage.url
    ),
    author{
      name,
      initials,
      avatar_url
    }
  }
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"] | order(_updatedAt desc)[0] {
  ...
}`;
