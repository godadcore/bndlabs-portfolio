import type {StructureResolver} from 'sanity/structure'

const PRACTICES = [
  ['product-design', 'Product Design & UI/UX'],
  ['software-engineering', 'Software Engineering'],
  ['ai-machine-learning', 'AI & Machine Learning'],
  ['graphic-design', 'Graphic Design & Branding'],
  ['content-language', 'Content & Language'],
  ['video-clipping', 'Video Clipping & Creative Media'],
] as const

export const practiceTemplates = PRACTICES.map(([value, title]) => ({
  id: `project-${value}`,
  title,
  schemaType: 'caseStudy',
  value: {discipline: value},
}))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Bndlabs')
    .items([
      S.listItem()
        .title('Projects')
        .child(
          S.list()
            .title('Projects')
            .items([
              ...PRACTICES.map(([value, title]) =>
                S.listItem()
                  .title(title)
                  .schemaType('caseStudy')
                  .child(
                    S.documentTypeList('caseStudy')
                      .title(title)
                      .filter('_type == "caseStudy" && discipline == $discipline')
                      .params({discipline: value})
                      .initialValueTemplates([S.initialValueTemplateItem(`project-${value}`)]),
                  ),
              ),
              S.listItem()
                .title('Choose a practice')
                .schemaType('caseStudy')
                .child(
                  S.documentTypeList('caseStudy')
                    .title('Choose a practice')
                    .filter('_type == "caseStudy" && !defined(discipline)'),
                ),
            ]),
        ),
      S.listItem()
        .title('Notes')
        .schemaType('post')
        .child(S.documentTypeList('post').title('Notes')),
      S.divider(),
      S.listItem()
        .title('Site')
        .schemaType('siteSettings')
        .child(S.documentTypeList('siteSettings').title('Site')),
    ])
