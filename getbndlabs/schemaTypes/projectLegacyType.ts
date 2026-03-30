import {defineField, defineType} from 'sanity'

const stringListField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{type: 'string'}],
  })

const textCardArrayField = (
  name: string,
  title: string,
  itemName: string,
  itemTitle: string,
  bodyName = 'text',
  bodyTitle = 'Text',
) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineField({
        name: itemName,
        title: itemTitle,
        type: 'object',
        fields: [
          defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
          }),
          defineField({
            name: bodyName,
            title: bodyTitle,
            type: 'text',
            rows: 4,
          }),
        ],
        preview: {
          select: {
            title: 'title',
            subtitle: bodyName,
          },
        },
      }),
    ],
  })

const imageListField = (name: string, title: string, itemName: string, itemTitle: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineField({
        name: itemName,
        title: itemTitle,
        type: 'object',
        fields: [
          defineField({
            name: 'src',
            title: 'Image URL',
            type: 'string',
          }),
          defineField({
            name: 'alt',
            title: 'Alt Text',
            type: 'string',
          }),
        ],
        preview: {
          select: {
            title: 'alt',
            subtitle: 'src',
          },
        },
      }),
    ],
  })

export const projectType = defineType({
  name: 'project',
  title: 'Projects',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
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
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'liveProjectUrl',
      title: 'Live Project URL',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          allowRelative: false,
          scheme: ['https', 'http'],
        }),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
    }),
    defineField({
      name: 'tag1',
      title: 'Tag 1',
      type: 'string',
    }),
    defineField({
      name: 'tag2',
      title: 'Tag 2',
      type: 'string',
    }),
    defineField({
      name: 'goal',
      title: 'Goal',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'solution',
      title: 'Solution',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'my_role',
      title: 'My Role',
      type: 'string',
    }),
    textCardArrayField('challenges', 'Challenges', 'challenge', 'Challenge'),
    defineField({
      name: 'discovery',
      title: 'Discovery',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'overview',
      title: 'Overview',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'problem',
      title: 'Problem',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'result',
      title: 'Result',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [
        defineField({
          name: 'highlight',
          title: 'Highlight',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'value',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'process',
      title: 'Process',
      type: 'object',
      fields: [
        defineField({
          name: 'structure',
          title: 'Structure',
          type: 'object',
          fields: [
            defineField({
              name: 'intro',
              title: 'Intro',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'image',
              title: 'Image URL',
              type: 'string',
            }),
          ],
        }),
        defineField({
          name: 'design',
          title: 'Design',
          type: 'object',
          fields: [
            defineField({
              name: 'intro',
              title: 'Intro',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'image',
              title: 'Image URL',
              type: 'string',
            }),
            defineField({
              name: 'overview_image',
              title: 'Overview Image URL',
              type: 'string',
            }),
            defineField({
              name: 'screens',
              title: 'Screens',
              type: 'array',
              of: [
                defineField({
                  name: 'screen',
                  title: 'Screen',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'src',
                      title: 'Image URL',
                      type: 'string',
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
                      subtitle: 'src',
                    },
                  },
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: 'delivery',
          title: 'Delivery',
          type: 'object',
          fields: [
            defineField({
              name: 'intro',
              title: 'Intro',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'prototype_screen',
              title: 'Prototype Screen URL',
              type: 'string',
            }),
            stringListField('bullets', 'Bullets'),
          ],
        }),
        defineField({
          name: 'integration',
          title: 'Integration',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [
            defineField({
              name: 'step',
              title: 'Step',
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
                  type: 'text',
                  rows: 3,
                }),
              ],
              preview: {
                select: {
                  title: 'title',
                  subtitle: 'description',
                },
              },
            }),
          ],
        }),
        stringListField('next_steps', 'Next Steps'),
      ],
    }),
    defineField({
      name: 'user_research',
      title: 'User Research',
      type: 'object',
      fields: [
        defineField({
          name: 'method',
          title: 'Method',
          type: 'text',
          rows: 4,
        }),
        defineField({
          name: 'persona',
          title: 'Persona',
          type: 'array',
          of: [
            defineField({
              name: 'persona_entry',
              title: 'Persona',
              type: 'object',
              fields: [
                defineField({
                  name: 'image',
                  title: 'Image URL',
                  type: 'string',
                }),
                defineField({
                  name: 'name',
                  title: 'Name',
                  type: 'string',
                }),
                defineField({
                  name: 'age',
                  title: 'Age',
                  type: 'string',
                }),
                defineField({
                  name: 'gender',
                  title: 'Gender',
                  type: 'string',
                }),
                defineField({
                  name: 'occupation',
                  title: 'Occupation',
                  type: 'string',
                }),
                defineField({
                  name: 'location',
                  title: 'Location',
                  type: 'string',
                }),
                defineField({
                  name: 'education',
                  title: 'Education',
                  type: 'string',
                }),
                defineField({
                  name: 'quote',
                  title: 'Quote',
                  type: 'text',
                  rows: 3,
                }),
                defineField({
                  name: 'bio',
                  title: 'Bio',
                  type: 'text',
                  rows: 4,
                }),
                stringListField('goals', 'Goals'),
                stringListField('frustrations', 'Frustrations'),
              ],
              preview: {
                select: {
                  title: 'name',
                  subtitle: 'occupation',
                },
              },
            }),
          ],
        }),
        defineField({
          name: 'journey_mapping',
          title: 'Journey Mapping',
          type: 'object',
          fields: [
            defineField({
              name: 'goal',
              title: 'Goal',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'image',
              title: 'Image URL',
              type: 'string',
            }),
          ],
        }),
        textCardArrayField('findings', 'Findings', 'finding', 'Finding'),
      ],
    }),
    defineField({
      name: 'outcomes',
      title: 'Outcomes',
      type: 'object',
      fields: [
        defineField({
          name: 'intro',
          title: 'Intro',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'impact',
          title: 'Impact',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'learned',
          title: 'Learned',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'object',
      fields: [
        defineField({
          name: 'cover',
          title: 'Cover URL',
          type: 'string',
        }),
        defineField({
          name: 'thumbnail',
          title: 'Thumbnail URL',
          type: 'string',
        }),
        imageListField('gallery', 'Gallery', 'gallery_item', 'Gallery Item'),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Image URL',
      type: 'string',
    }),
    defineField({
      name: 'cover',
      title: 'Cover URL',
      type: 'string',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail URL',
      type: 'string',
    }),
    textCardArrayField('sections', 'Sections', 'section', 'Section', 'body', 'Body'),
    imageListField('gallery', 'Gallery', 'gallery_entry', 'Gallery Item'),
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
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'published',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
      },
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'client',
      status: 'status',
    },
    prepare({title, subtitle, status}) {
      const parts = [subtitle, status].filter(Boolean)
      return {
        title,
        subtitle: parts.join(' | '),
      }
    },
  },
})
