import {getProjectCliClient} from '../getbndlabs/node_modules/@sanity/cli-core/dist/services/apiClient.js'
import {
  getSanityConfigFromEnv,
  loadLocalEnvFiles,
} from '../src/lib/sanity/nodeEnvironment.js'

function firstString(...values) {
  for (const value of values) {
    const normalized = String(value ?? '').trim()
    if (normalized) return normalized
  }

  return ''
}

function plainTextFromPortableText(blocks) {
  if (!Array.isArray(blocks)) return ''

  return blocks
    .flatMap((block) => (Array.isArray(block?.children) ? block.children : []))
    .map((child) => String(child?.text ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .trim()
}

function textParagraphs(value) {
  return String(value ?? '')
    .split(/\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function hasAsset(value) {
  return Boolean(value?.asset?._ref || value?.asset?.url)
}

function normalizeImage(value) {
  const image = value?.image ?? value
  if (!hasAsset(image)) return null

  const normalized = {
    _type: 'image',
    asset: image.asset,
  }

  if (image.crop) normalized.crop = image.crop
  if (image.hotspot) normalized.hotspot = image.hotspot

  return normalized
}

function normalizeImageArray(items) {
  if (!Array.isArray(items)) return []

  return items.map((item) => normalizeImage(item)).filter(Boolean)
}

function needsImageArrayMigration(items) {
  return Array.isArray(items) && items.some((item) => item?.image && !item?.asset)
}

function normalizeProblems(items) {
  if (!Array.isArray(items)) return []

  return items
    .map((item) => ({
      _type: 'problem',
      title: firstString(item?.title),
      description: firstString(item?.description),
    }))
    .filter((item) => item.title || item.description)
}

function deriveProblems(objectives) {
  if (!Array.isArray(objectives)) return []

  return objectives
    .map((item) => ({
      _type: 'problem',
      title: firstString(item?.title),
      description: firstString(item?.description, item?.text, item?.status && `Status: ${item.status}`),
    }))
    .filter((item) => item.title || item.description)
}

function getMigrationPayload(document) {
  const payload = {}
  const portableOverview = plainTextFromPortableText(document?.overview)
  const descriptionParagraphs = textParagraphs(document?.description)
  const shortIntro = descriptionParagraphs[0]
  const longOverview = firstString(portableOverview, descriptionParagraphs.slice(1).join(' '), shortIntro)

  if (!firstString(document?.overviewText) && shortIntro) {
    payload.overviewText = shortIntro
  }

  if (!firstString(document?.overviewDescription) && longOverview) {
    payload.overviewDescription = longOverview
  }

  if (!hasAsset(document?.overviewImage) && hasAsset(document?.heroImage)) {
    payload.overviewImage = normalizeImage(document.heroImage)
  }

  if (needsImageArrayMigration(document?.researchImages)) {
    payload.researchImages = normalizeImageArray(document.researchImages)
  }

  if (needsImageArrayMigration(document?.wireframeImages)) {
    payload.wireframeImages = normalizeImageArray(document.wireframeImages)
  }

  if (needsImageArrayMigration(document?.prototypeImages)) {
    payload.prototypeImages = normalizeImageArray(document.prototypeImages)
  }

  if ((!Array.isArray(document?.finalImages) || !document.finalImages.length) && Array.isArray(document?.finalGallery) && document.finalGallery.length) {
    payload.finalImages = normalizeImageArray(document.finalGallery)
  }

  if ((!Array.isArray(document?.problems) || !document.problems.length) && Array.isArray(document?.objectives) && document.objectives.length) {
    const derivedProblems = deriveProblems(document.objectives)
    if (derivedProblems.length) {
      payload.problems = derivedProblems
    }
  }

  return payload
}

async function main() {
  loadLocalEnvFiles(process.cwd())
  const {projectId, dataset, apiVersion} = getSanityConfigFromEnv()

  const client = await getProjectCliClient({
    requireUser: true,
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
  })

  const caseStudies = await client.fetch(
    `*[_type == "caseStudy"]{
      _id,
      title,
      slug,
      description,
      heroImage,
      overview,
      overviewImage,
      overviewText,
      overviewDescription,
      researchImages,
      wireframeImages,
      prototypeImages,
      finalImages,
      finalGallery,
      problems,
      objectives
    }`
  )

  const patchedDocuments = []

  for (const document of caseStudies) {
    const payload = getMigrationPayload(document)
    if (!Object.keys(payload).length) continue

    await client.patch(document._id).set(payload).commit({autoGenerateArrayKeys: true})
    patchedDocuments.push({
      id: document._id,
      title: document.title,
      fields: Object.keys(payload),
    })
  }

  console.log(JSON.stringify({patchedDocuments}, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
