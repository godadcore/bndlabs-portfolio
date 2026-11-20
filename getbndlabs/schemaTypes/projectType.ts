import {defineField, defineType} from 'sanity'
import {PracticeField} from './practiceField'
import {
  portableTextToPlainText,
  richInlineField,
  richInlineListField,
  richTextBlocks,
  richTextField,
} from './richTextFields'

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
          }),
          defineField({
            name: 'alt',
            title: 'Alt Text',
            type: 'string',
          }),
          defineField({
            name: 'caption',
            title: 'Caption',
            type: 'array',
            of: richTextBlocks,
          }),
        ],
        preview: {
          select: {
            title: 'caption',
            subtitle: 'alt',
            media: 'image',
          },
          prepare({title, subtitle, media}) {
            return {
              title: portableTextToPlainText(title) || subtitle || 'Media item',
              subtitle: subtitle || '',
              media,
            }
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
      fields: [richInlineListField('cells', 'Cell Values', 'cell', 'Cell')],
      preview: {
        select: {
          title: 'cells',
        },
        prepare({title}) {
          return {
            title: portableTextToPlainText(title) || 'Table row',
          }
        },
      },
    }),
  ],
})

/* ─────────────────────────────────────────
   SECTION TYPES  (all exported so postType.ts can reuse them)
   Rules: no section is locked/required/undeletable
───────────────────────────────────────── */

export const imageSectionType = defineField({
  name: 'imageSection',
  title: 'Image',
  type: 'object',
  fields: [
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
    richInlineField('caption', 'Caption'),
  ],
  preview: {
    select: {
      title: 'alt',
      media: 'image',
    },
    prepare({title, media}) {
      return {
        title: title || 'Image section',
        media,
      }
    },
  },
})

export const storySectionType = defineField({
  name: 'storySection',
  title: 'Flexible Content Section',
  type: 'object',
  fields: [
    richInlineField('title', 'Heading'),
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
    richInlineField('caption', 'Caption'),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({title, media}) {
      return {
        title: portableTextToPlainText(title) || 'Flexible content section',
        media,
      }
    },
  },
})

export const frameGroupSectionType = defineField({
  name: 'frameGroupSection',
  title: 'Grouped Frames',
  type: 'object',
  fields: [
    richInlineField('title', 'Heading'),
    richTextField('body', 'Content'),
    defineField({
      name: 'frames',
      title: 'Frames',
      type: 'array',
      validation: (Rule) => Rule.max(10).error('Maximum 10 images per group'),
      of: [
        defineField({
          name: 'framesItem',
          title: 'Frame',
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
            }),
            defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
            defineField({name: 'caption', title: 'Caption', type: 'array', of: richTextBlocks}),
          ],
          preview: {
            select: {title: 'alt', media: 'image'},
            prepare({title, media}) {
              return {title: title || 'Frame', media}
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'frames.0.image',
    },
    prepare({title, media}) {
      return {
        title: portableTextToPlainText(title) || 'Grouped frames',
        media,
      }
    },
  },
})

export const videoSectionType = defineField({
  name: 'videoSection',
  title: 'Video Section',
  type: 'object',
  fields: [
    richInlineField('title', 'Heading'),
    richTextField('body', 'Content'),
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'url',
      description: 'YouTube, Vimeo, or any embed-safe URL. Renders as an iframe.',
    }),
    defineField({
      name: 'video',
      title: 'Video File Upload',
      type: 'file',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'poster',
      title: 'Poster Image',
      type: 'image',
      options: {hotspot: true},
    }),
    richInlineField('caption', 'Caption'),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'caption',
      media: 'poster',
    },
    prepare({title, subtitle, media}) {
      return {
        title: portableTextToPlainText(title) || 'Video section',
        subtitle: portableTextToPlainText(subtitle) || 'Video section',
        media,
      }
    },
  },
})

export const audioSectionType = defineField({
  name: 'audioSection',
  title: 'Voice Note Section',
  type: 'object',
  fields: [
    richInlineField('title', 'Heading'),
    richTextField('body', 'Content'),
    defineField({
      name: 'audio',
      title: 'Audio File',
      type: 'file',
      options: {
        accept: 'audio/*',
      },
    }),
    richInlineField('caption', 'Caption'),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'caption',
    },
    prepare({title, subtitle}) {
      return {
        title: portableTextToPlainText(title) || 'Voice note section',
        subtitle: portableTextToPlainText(subtitle) || 'Voice note section',
      }
    },
  },
})

export const tableSectionType = defineField({
  name: 'tableSection',
  title: 'Table Section',
  type: 'object',
  fields: [
    richInlineField('title', 'Heading'),
    richTextField('body', 'Content'),
    richInlineListField('columns', 'Column Headers', 'column', 'Column'),
    tableRowsField,
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'columns',
    },
    prepare({title, subtitle}) {
      return {
        title: portableTextToPlainText(title) || 'Table section',
        subtitle: portableTextToPlainText(subtitle)
          ? `Starts with ${portableTextToPlainText(subtitle)}`
          : 'Table section',
      }
    },
  },
})

export const embeddedCodeSectionType = defineField({
  name: 'embeddedCodeSection',
  title: 'Embedded Code / Embed',
  type: 'object',
  fields: [
    richInlineField('title', 'Heading'),
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'url',
      description: 'YouTube, Vimeo, or any iframe-safe URL. Renders as a responsive iframe.',
    }),
    defineField({
      name: 'code',
      title: 'Code Snippet',
      type: 'text',
      rows: 12,
      description: 'Paste the code. It is colored on the project page.',
    }),
    defineField({
      name: 'codeLanguage',
      title: 'Language',
      type: 'string',
      options: {
        list: ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'JSON', 'Bash'],
      },
    }),
    richInlineField('language', 'Language label'),
    richInlineField('caption', 'Caption'),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'embedUrl',
    },
    prepare({title, subtitle}) {
      return {
        title: portableTextToPlainText(title) || 'Embedded code section',
        subtitle: subtitle || 'Code block',
      }
    },
  },
})

/* ─────────────────────────────────────────
   CASE STUDY DOCUMENT TYPE
───────────────────────────────────────── */

const CODE = ['software-engineering', 'ai-machine-learning']
const WRITING = ['graphic-design', 'content-language']
const VIDEO = ['video-clipping']
const RESEARCH_PICTURES = ['product-design', 'graphic-design']
const PAGE_NOTES = ['software-engineering', 'ai-machine-learning', 'graphic-design', 'content-language', 'video-clipping']
const LINKED = ['product-design', 'software-engineering', 'ai-machine-learning']

type PracticeContext = {document?: {discipline?: string}; parent?: {discipline?: string}}

const practiceOf = ({document, parent}: PracticeContext) =>
  document?.discipline || parent?.discipline || ''

const showFor = (slugs: string[]) => (context: PracticeContext) => !slugs.includes(practiceOf(context))

const practiceTitles = {
  researchText: {
    'product-design': 'Research',
    'software-engineering': 'Notes',
    'ai-machine-learning': 'Method',
    'graphic-design': 'Exploration',
    'content-language': 'Research',
    'video-clipping': 'Approach',
  },
  wireframeText: {
    'software-engineering': 'Interface',
    'ai-machine-learning': 'System',
    'graphic-design': 'Identity',
    'content-language': 'Draft',
    'video-clipping': 'Edit',
  },
  prototypeText: {
    'product-design': 'Results introduction',
    'software-engineering': 'Results introduction',
    'ai-machine-learning': 'Results introduction',
    'graphic-design': 'Results introduction',
    'content-language': 'Results introduction',
    'video-clipping': 'Results introduction',
  },
  finalImages: {
    'product-design': 'Final interface',
    'software-engineering': 'Screens',
    'ai-machine-learning': 'Output',
    'graphic-design': 'Final artwork',
    'content-language': 'Pictures',
    'video-clipping': 'Stills',
  },
  liveUrl: {
    'product-design': 'Website link',
    'software-engineering': 'Live site link',
    'ai-machine-learning': 'Live site link',
  },
  writing: {
    'graphic-design': 'Guidelines',
    'content-language': 'Writing',
  },
  researchImages: {
    'product-design': 'Research pictures',
    'graphic-design': 'Exploration pictures',
  },
}

export const caseStudyType = defineType({
  name: 'caseStudy',
  title: 'Projects',
  type: 'document',
  groups: [
    {name: 'basics', title: 'Basics', default: true},
    {name: 'story', title: 'Story'},
    {name: 'pictures', title: 'Pictures'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'array',
      of: richTextBlocks,
      validation: (Rule) => Rule.required(),
      group: 'basics',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) => portableTextToPlainText(doc?.title),
      },
      validation: (Rule) => Rule.required(),
      group: 'basics',
    }),
    defineField({
      name: 'brandLogo',
      title: 'Brand Logo',
      type: 'image',
      options: {hotspot: true},
      description: 'Logo image only. Do not include brand name text in the artwork.',
      group: 'pictures',
      hidden: () => true,
    }),
    defineField({
      name: 'description',
      title: 'Short Intro',
      description: 'The sentence under the title.',
      type: 'array',
      of: richTextBlocks,
      validation: (Rule) => Rule.required(),
      group: 'basics',
    }),
    {...richInlineField('category', 'Category'), group: 'basics'},
    defineField({
      name: 'discipline',
      title: 'Practice',
      type: 'string',
      description: 'Choose this first. The rest of the form changes to match that page.',
      options: {
        list: [
          {title: 'Product Design & UI/UX', value: 'product-design'},
          {title: 'Software Engineering', value: 'software-engineering'},
          {title: 'AI & Machine Learning', value: 'ai-machine-learning'},
          {title: 'Graphic Design & Branding', value: 'graphic-design'},
          {title: 'Content & Language', value: 'content-language'},
          {title: 'Video Clipping & Creative Media', value: 'video-clipping'},
        ],
        layout: 'dropdown',
      },
      group: 'basics',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedDate',
      title: 'Year',
      description: 'Shown beside Category, Role, and Tools. Only the year is used.',
      type: 'date',
      group: 'basics',
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
      group: 'basics',
    }),
    defineField({
      name: 'liveUrl',
      title: 'Website link',
      description: 'The button under the title. Leave it empty if this page has no button.',
      type: 'url',
      group: 'basics',
      hidden: showFor(LINKED),
      components: {field: PracticeField},
      options: {practiceTitles: practiceTitles.liveUrl},
    }),
    defineField({
      name: 'repositoryUrl',
      title: 'GitHub link',
      description: 'The button that says View on GitHub.',
      type: 'url',
      group: 'basics',
      hidden: showFor(CODE),
    }),
    defineField({
      name: 'prototypeUrl',
      title: 'View Prototype URL',
      type: 'url',
      hidden: () => true,
    }),
    defineField({
      name: 'twitterUrl',
      title: 'View on X URL',
      type: 'url',
      hidden: () => true,
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp Number',
      type: 'string',
      hidden: () => true,
    }),
    defineField({
      name: 'heroImage',
      title: 'Cover',
      description: 'The large picture under the title.',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
      group: 'pictures',
    }),
    defineField({
      name: 'overviewImage',
      title: 'Overview Image',
      type: 'image',
      options: {hotspot: true},
      group: 'pictures',
      hidden: () => true,
    }),
    {...richTextField('overviewText', 'Overview'), description: 'The first section on the page.', group: 'story'},
    {...richTextField('overviewDescription', 'Overview Description'), hidden: () => true},
    {...mediaArrayField('images', 'Project Images'), group: 'pictures', hidden: () => true},
    defineField({
      name: 'sections',
      title: 'Project Sections',
      type: 'array',
      description: 'Add a block for text, images, video, or code.',
      group: 'story',
      hidden: () => true,
      of: [
        imageSectionType,
        storySectionType,
        frameGroupSectionType,
        videoSectionType,
        audioSectionType,
        tableSectionType,
        embeddedCodeSectionType,
      ],
    }),
    defineField({
      name: 'overview',
      title: 'Overview',
      type: 'array',
      of: richTextBlocks,
      hidden: () => true,
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
            richInlineField('label', 'Label'),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'value',
            },
            prepare({title, subtitle}) {
              return {
                title: portableTextToPlainText(title) || 'Stat',
                subtitle: subtitle != null ? String(subtitle) : '',
              }
            },
          },
        }),
      ],
      hidden: () => true,
    }),
    {...richInlineListField('role', 'Role', 'roleItem', 'Role Item'), description: 'Shown beside the year.', group: 'basics'},
    {...richInlineListField('tools', 'Tools', 'toolItem', 'Tool Item'), description: 'Shown beside the year.', group: 'basics'},
    {...richInlineListField('timeline', 'Timeline', 'timelineItem', 'Timeline Item'), hidden: () => true},
    defineField({
      name: 'problems',
      title: 'Problem',
      description: 'Each item is one numbered point. The title is the bold line.',
      type: 'array',
      of: [
        defineField({
          name: 'problem',
          title: 'Problem',
          type: 'object',
          fields: [
            richInlineField('title', 'Title'),
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
                title: portableTextToPlainText(title) || 'Problem',
                subtitle: portableTextToPlainText(subtitle) || '',
              }
            },
          },
        }),
      ],
      group: 'story',
    }),
    {
      ...richTextField('researchText', 'Research'),
      description: 'The paragraph for this section.',
      group: 'story',
      components: {field: PracticeField},
      options: {practiceTitles: practiceTitles.researchText},
    },
    {
      ...imageArrayField('researchImages', 'Research pictures'),
      description: 'Pictures that sit in that same section.',
      group: 'pictures',
      hidden: showFor(RESEARCH_PICTURES),
      components: {field: PracticeField},
      options: {practiceTitles: practiceTitles.researchImages},
    },
    {
      ...richTextField('wireframeText', 'Interface'),
      description: 'The paragraph for this section.',
      group: 'story',
      hidden: showFor(PAGE_NOTES),
      components: {field: PracticeField},
      options: {practiceTitles: practiceTitles.wireframeText},
    },
    {...imageArrayField('wireframeImages', 'Identity pictures'), group: 'pictures', hidden: () => true},
    defineField({
      name: 'writing',
      title: 'Writing',
      description: 'Each block becomes its own heading on the page. Write the heading, then the paragraph.',
      group: 'story',
      hidden: showFor(WRITING),
      components: {field: PracticeField},
      options: {practiceTitles: practiceTitles.writing},
      type: 'array',
      of: [
        defineField({
          name: 'writingItem',
          title: 'Writing',
          type: 'object',
          fields: [
            defineField({name: 'heading', title: 'Heading', type: 'string'}),
            defineField({name: 'body', title: 'Paragraph', type: 'text', rows: 8}),
          ],
          preview: {
            select: {title: 'heading'},
            prepare({title}) {
              return {title: title || 'Writing'}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'codeSamples',
      title: 'Code',
      description: 'Each block is a heading, a short note, and the code. The code is colored on the page.',
      group: 'story',
      hidden: showFor(CODE),
      type: 'array',
      of: [
        defineField({
          name: 'codeSample',
          title: 'Code',
          type: 'object',
          fields: [
            defineField({name: 'heading', title: 'Heading', type: 'string'}),
            defineField({name: 'note', title: 'Note', type: 'text', rows: 3}),
            defineField({
              name: 'language',
              title: 'Language',
              type: 'string',
              options: {
                list: ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'JSON', 'Bash'],
              },
            }),
            defineField({name: 'code', title: 'Code', type: 'text', rows: 16}),
          ],
          preview: {
            select: {title: 'heading', subtitle: 'language'},
            prepare({title, subtitle}) {
              return {title: title || 'Code', subtitle: subtitle || ''}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'videos',
      title: 'Videos',
      description: 'One film. It is the player on the project page. Paste a YouTube, Shorts, TikTok, Vimeo, X, or MP4 link.',
      group: 'story',
      hidden: showFor(VIDEO),
      type: 'array',
      of: [
        defineField({
          name: 'videoItem',
          title: 'Video',
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'hostedUrl',
              title: 'Video link',
              description: 'YouTube, YouTube Shorts, TikTok, Vimeo, X, or a direct MP4 or WebM file.',
              type: 'url',
            }),
            defineField({name: 'poster', title: 'Poster', type: 'image', options: {hotspot: true}}),
            defineField({name: 'credit', title: 'Credit', type: 'string'}),
            defineField({name: 'duration', title: 'Length', description: 'Shown under the player, for example 0:30.', type: 'string'}),
            defineField({
              name: 'orientation',
              title: 'Shape',
              description: 'Portrait for a phone video. Landscape for a wide video.',
              type: 'string',
              options: {
                list: [
                  {title: 'Landscape', value: 'landscape'},
                  {title: 'Portrait', value: 'portrait'},
                ],
              },
            }),
            defineField({name: 'aspectRatio', title: 'Aspect ratio', description: 'Optional. For example 16:9 or 9:16.', type: 'string'}),
            defineField({name: 'startSeconds', title: 'Start at (seconds)', type: 'number'}),
            defineField({name: 'endSeconds', title: 'End at (seconds)', type: 'number'}),
            defineField({name: 'autoplay', title: 'Play when on screen', type: 'boolean', initialValue: true}),
            defineField({name: 'muted', title: 'Start muted', type: 'boolean', initialValue: true}),
            defineField({name: 'loop', title: 'Loop', type: 'boolean', initialValue: false}),
          ],
          preview: {
            select: {title: 'title', media: 'poster'},
            prepare({title, media}) {
              return {title: title || 'Video', media}
            },
          },
        }),
      ],
    }),
    {
      ...richTextField('prototypeText', 'Results introduction'),
      description: 'The paragraph at the start of Results.',
      group: 'story',
      components: {field: PracticeField},
      options: {practiceTitles: practiceTitles.prototypeText},
    },
    {...imageArrayField('prototypeImages', 'Prototype Images'), group: 'pictures', hidden: () => true},
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
            richInlineField('metric', 'Metric'),
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
            prepare({title, subtitle}) {
              return {
                title: portableTextToPlainText(title) || 'Result',
                subtitle: portableTextToPlainText(subtitle) || '',
              }
            },
          },
        }),
      ],
      group: 'story',
    }),
    {
      ...imageArrayField('finalImages', 'Final images'),
      description: 'Extra pictures for this section. The cover is already at the top.',
      group: 'pictures',
      components: {field: PracticeField},
      options: {practiceTitles: practiceTitles.finalImages},
    },
    {...richInlineListField('nextSteps', 'Next Steps', 'nextStepItem', 'Next Step'), hidden: () => true},
    {...richInlineListField('tasks', 'Tasks', 'taskItem', 'Task'), hidden: () => true},
    {...richInlineListField('tags', 'Tags', 'tagItem', 'Tag'), hidden: () => true},
    {...richInlineField('client', 'Client'), hidden: () => true},
    {...richInlineField('industry', 'Industry'), hidden: () => true},
    defineField({
      name: 'date',
      title: 'Legacy Date',
      type: 'datetime',
      description: 'Optional alias kept for imported legacy project data.',
      hidden: () => true,
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
      hidden: () => true,
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
        title: portableTextToPlainText(title) || 'Untitled case study',
        subtitle: parts
          .map((part) => portableTextToPlainText(part) || String(part))
          .filter(Boolean)
          .join(' | '),
        media,
      }
    },
  },
})
