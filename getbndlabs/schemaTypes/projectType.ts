import {defineField, defineType} from 'sanity'

const stringListField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{type: 'string'}],
  })

const mediaArrayField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineField({
        name: `${name}Item`,
        title: `${title} Item`,
        type: 'object',
        fields: [
          defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {hotspot: true},
            validation: (Rule) => Rule.required(),
          }),
          defineField({
            name: 'alt',
            title: 'Alt Text',
            type: 'string',
          }),
          defineField({
            name: 'caption',
            title: 'Caption',
            type: 'string',
          }),
        ],
        preview: {
          select: {
            title: 'caption',
            subtitle: 'alt',
            media: 'image',
          },
        },
      }),
    ],
  })

export const caseStudyType = defineType({
  name: 'caseStudy',
  title: 'Case Studies',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brandLogo',
      title: 'Brand Logo',
      type: 'image',
      options: {hotspot: true},
      description: 'Logo image only. Do not include brand name text in the artwork.',
    }),
    defineField({
      name: 'description',
      title: 'Short Intro',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
    }),
    defineField({
      name: 'publishedDate',
      title: 'Published Date',
      type: 'date',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'Concept',
      options: {
        list: [
          {title: 'Live', value: 'Live'},
          {title: 'In Progress', value: 'In Progress'},
          {title: 'Concept', value: 'Concept'},
        ],
      },
    }),
    defineField({
      name: 'liveUrl',
      title: 'Visit Website URL',
      type: 'url',
    }),
    defineField({
      name: 'prototypeUrl',
      title: 'View Prototype URL',
      type: 'url',
    }),
    defineField({
      name: 'twitterUrl',
      title: 'View on X URL',
      type: 'url',
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp Number',
      type: 'string',
      description: 'Digits only, including country code. Example: 2348012345678',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'overview',
      title: 'Overview',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [
        defineField({
          name: 'stat',
          title: 'Stat',
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'number',
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'value',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Stat',
                subtitle: subtitle != null ? String(subtitle) : '',
              }
            },
          },
        }),
      ],
    }),
    stringListField('role', 'Role'),
    stringListField('tools', 'Tools'),
    stringListField('timeline', 'Timeline'),
    mediaArrayField('researchImages', 'Research Images'),
    mediaArrayField('wireframeImages', 'Wireframe Images'),
    mediaArrayField('prototypeImages', 'Prototype Images'),
    defineField({
      name: 'results',
      title: 'Results',
      type: 'array',
      of: [
        defineField({
          name: 'result',
          title: 'Result',
          type: 'object',
          fields: [
            defineField({
              name: 'metric',
              title: 'Metric',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: {
              title: 'metric',
              subtitle: 'description',
            },
          },
        }),
      ],
    }),
    mediaArrayField('finalGallery', 'Final Gallery'),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      status: 'status',
      media: 'heroImage',
    },
    prepare({title, subtitle, status, media}) {
      const parts = [subtitle, status].filter(Boolean)
      return {
        title,
        subtitle: parts.join(' | '),
        media,
      }
    },
  },
})
