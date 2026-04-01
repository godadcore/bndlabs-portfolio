import {defineArrayMember, defineField, defineType} from 'sanity'

const stringListField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{type: 'string'}],
  })

const richTextBlocks = [
  defineArrayMember({
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'},
      {title: 'Heading 1', value: 'h1'},
      {title: 'Heading 2', value: 'h2'},
      {title: 'Heading 3', value: 'h3'},
      {title: 'Heading 4', value: 'h4'},
      {title: 'Quote', value: 'blockquote'},
    ],
    lists: [
      {title: 'Bullet', value: 'bullet'},
      {title: 'Numbered', value: 'number'},
    ],
    marks: {
      decorators: [
        {title: 'Bold', value: 'strong'},
        {title: 'Italic', value: 'em'},
        {title: 'Underline', value: 'underline'},
        {title: 'Code', value: 'code'},
      ],
      annotations: [
        defineArrayMember({
          name: 'link',
          title: 'Link',
          type: 'object',
          fields: [
            defineField({
              name: 'href',
              title: 'URL or path',
              type: 'string',
              description: 'Use a full URL like https://example.com or an internal path like /work.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'href',
            },
            prepare({title}) {
              return {
                title: title || 'Link',
              }
            },
          },
        }),
      ],
    },
  }),
]

const richTextField = (
  name: string,
  title: string,
  description?: string,
) =>
  defineField({
    name,
    title,
    type: 'array',
    ...(description ? {description} : {}),
    of: richTextBlocks,
  })

const sectionIconField = defineField({
  name: 'icon',
  title: 'Icon',
  type: 'string',
  description: 'Optional icon hint used for sidebar section navigation on the frontend.',
  options: {
    list: [
      {title: 'Overview', value: 'overview'},
      {title: 'Project Scope', value: 'project-scope'},
      {title: 'Research', value: 'research'},
      {title: 'Problem', value: 'problem'},
      {title: 'Wireframe', value: 'wireframe'},
      {title: 'Prototype', value: 'prototype'},
      {title: 'Results', value: 'results'},
    ],
  },
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

const imageArrayField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineField({
        name: `${name}Item`,
        title: `${title} Item`,
        type: 'image',
        options: {hotspot: true},
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
  title: 'Flexible Content Section',
  type: 'object',
  fields: [
    sectionIconField,
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    richTextField(
      'body',
      'Content',
      'Optional rich text. Leave the image empty for a text-only section, or leave content light for a full-width image section.',
    ),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
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
      media: 'image',
    },
  },
})

const frameGroupSectionType = defineField({
  name: 'frameGroupSection',
  title: 'Grouped Frames',
  type: 'object',
  fields: [
    sectionIconField,
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    richTextField('body', 'Content'),
    mediaArrayField('frames', 'Frames'),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'frames.0.image',
    },
  },
})

const videoSectionType = defineField({
  name: 'videoSection',
  title: 'Video Section',
  type: 'object',
  fields: [
    sectionIconField,
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    richTextField('body', 'Content'),
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
    sectionIconField,
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    richTextField('body', 'Content'),
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
    sectionIconField,
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    richTextField('body', 'Content'),
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
      type: 'array',
      of: richTextBlocks,
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
      name: 'overviewImage',
      title: 'Overview Image',
      type: 'image',
      options: {hotspot: true},
    }),
    richTextField('overviewText', 'Overview Text'),
    richTextField('overviewDescription', 'Overview Description'),
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
      of: richTextBlocks,
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
      name: 'problems',
      title: 'Problems',
      type: 'array',
      of: [
        defineField({
          name: 'problem',
          title: 'Problem',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'array',
              of: richTextBlocks,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Problem',
                subtitle: subtitle || '',
              }
            },
          },
        }),
      ],
    }),
    richTextField('researchText', 'Research Text'),
    imageArrayField('researchImages', 'Research Images'),
    richTextField('wireframeText', 'Wireframe Text'),
    imageArrayField('wireframeImages', 'Wireframe Images'),
    richTextField('prototypeText', 'Prototype Text'),
    imageArrayField('prototypeImages', 'Prototype Images'),
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
              type: 'array',
              of: richTextBlocks,
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
    imageArrayField('finalImages', 'Final Images'),
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
