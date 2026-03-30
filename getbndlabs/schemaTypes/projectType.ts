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

const tableRowsField = defineField({
  name: 'rows',
  title: 'Rows',
  type: 'array',
  of: [
    defineField({
      name: 'tableRow',
      title: 'Row',
      type: 'object',
      fields: [stringListField('cells', 'Cell Values')],
      preview: {
        select: {
          title: 'cells.0',
        },
        prepare({title}) {
          return {
            title: title || 'Table row',
          }
        },
      },
    }),
  ],
})

const storySectionType = defineField({
  name: 'storySection',
  title: 'Image Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Short Paragraph',
      type: 'text',
      rows: 4,
    }),
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
      title: 'title',
      subtitle: 'body',
      media: 'image',
    },
  },
})

const frameGroupSectionType = defineField({
  name: 'frameGroupSection',
  title: 'Grouped Frames',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Short Paragraph',
      type: 'text',
      rows: 4,
    }),
    mediaArrayField('frames', 'Frames'),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
      media: 'frames.0.image',
    },
  },
})

const videoSectionType = defineField({
  name: 'videoSection',
  title: 'Video Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Short Paragraph',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'video',
      title: 'Video File',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'poster',
      title: 'Poster Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'caption',
      media: 'poster',
    },
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: subtitle || 'Video section',
        media,
      }
    },
  },
})

const audioSectionType = defineField({
  name: 'audioSection',
  title: 'Voice Note Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Short Paragraph',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'audio',
      title: 'Audio File',
      type: 'file',
      options: {
        accept: 'audio/*',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'caption',
    },
    prepare({title, subtitle}) {
      return {
        title,
        subtitle: subtitle || 'Voice note section',
      }
    },
  },
})

const tableSectionType = defineField({
  name: 'tableSection',
  title: 'Table Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Short Paragraph',
      type: 'text',
      rows: 4,
    }),
    stringListField('columns', 'Column Headers'),
    tableRowsField,
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'columns.0',
    },
    prepare({title, subtitle}) {
      return {
        title,
        subtitle: subtitle ? `Starts with ${subtitle}` : 'Table section',
      }
    },
  },
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
    mediaArrayField(
      'images',
      'Project Images',
    ),
    defineField({
      name: 'sections',
      title: 'Project Sections',
      type: 'array',
      description:
        'Flexible storytelling blocks. Reorder freely to control how the case study appears on the frontend.',
      of: [
        storySectionType,
        frameGroupSectionType,
        videoSectionType,
        audioSectionType,
        tableSectionType,
      ],
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
    defineField({
      name: 'objectives',
      title: 'Problem & Goal Items',
      type: 'array',
      of: [
        defineField({
          name: 'objective',
          title: 'Objective',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Short Label',
              type: 'string',
            }),
            defineField({
              name: 'text',
              title: 'Objective Text',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'status',
              title: 'Status',
              type: 'string',
              initialValue: 'Completed',
              options: {
                list: [
                  {title: 'Completed', value: 'Completed'},
                  {title: 'In Progress', value: 'In Progress'},
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'status',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Objective',
                subtitle: subtitle || 'Completed',
              }
            },
          },
        }),
      ],
    }),
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
    stringListField('nextSteps', 'Next Steps'),
    stringListField('tasks', 'Tasks'),
    stringListField('tags', 'Tags'),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
    }),
    defineField({
      name: 'date',
      title: 'Legacy Date',
      type: 'datetime',
      description: 'Optional alias kept for imported legacy project data.',
    }),
    defineField({
      name: 'liveProjectUrl',
      title: 'Legacy Live Project URL',
      type: 'url',
      description:
        'Optional alias kept for imported legacy project data. Prefer Visit Website URL for new case studies.',
      validation: (Rule) =>
        Rule.uri({
          allowRelative: false,
          scheme: ['https', 'http'],
        }),
    }),
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
