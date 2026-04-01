import {defineField, defineType} from 'sanity'
import {
  portableTextToPlainText,
  richInlineField,
  richInlineListField,
  richTextBlocks,
  richTextField,
} from './richTextFields'

const richPreview = (value: unknown, fallback: string) =>
  portableTextToPlainText(value) || fallback

const richTextCardArrayField = (
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
          richInlineField('title', 'Title'),
          richTextField(bodyName, bodyTitle),
        ],
        preview: {
          select: {
            title: 'title',
            subtitle: bodyName,
          },
          prepare({title, subtitle}) {
            return {
              title: richPreview(title, itemTitle),
              subtitle: richPreview(subtitle, ''),
            }
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
      options: {
        source: (doc) => portableTextToPlainText(doc?.title),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'array',
      of: richTextBlocks,
      validation: (Rule) => Rule.required(),
    }),
    richInlineField('subtitle', 'Subtitle'),
    richTextField('summary', 'Summary'),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: richTextBlocks,
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
    richInlineField('category', 'Category'),
    richInlineField('tag1', 'Tag 1'),
    richInlineField('tag2', 'Tag 2'),
    richTextField('goal', 'Goal'),
    richTextField('solution', 'Solution'),
    richInlineField('my_role', 'My Role'),
    richTextCardArrayField('challenges', 'Challenges', 'challenge', 'Challenge'),
    richTextField('discovery', 'Discovery'),
    richTextField('overview', 'Overview'),
    richTextField('problem', 'Problem'),
    richTextField('result', 'Result'),
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
            richInlineField('label', 'Label'),
            richInlineField('value', 'Value'),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'value',
            },
            prepare({title, subtitle}) {
              return {
                title: richPreview(title, 'Highlight'),
                subtitle: richPreview(subtitle, ''),
              }
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
            richTextField('intro', 'Intro'),
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
            richTextField('intro', 'Intro'),
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
                    richInlineField('label', 'Label'),
                  ],
                  preview: {
                    select: {
                      title: 'label',
                      subtitle: 'src',
                    },
                    prepare({title, subtitle}) {
                      return {
                        title: richPreview(title, 'Screen'),
                        subtitle,
                      }
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
            richTextField('intro', 'Intro'),
            defineField({
              name: 'prototype_screen',
              title: 'Prototype Screen URL',
              type: 'string',
            }),
            richInlineListField('bullets', 'Bullets', 'bulletItem', 'Bullet'),
          ],
        }),
        richTextField('integration', 'Integration'),
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
                richInlineField('title', 'Title'),
                richTextField('description', 'Description'),
              ],
              preview: {
                select: {
                  title: 'title',
                  subtitle: 'description',
                },
                prepare({title, subtitle}) {
                  return {
                    title: richPreview(title, 'Step'),
                    subtitle: richPreview(subtitle, ''),
                  }
                },
              },
            }),
          ],
        }),
        richInlineListField('next_steps', 'Next Steps', 'nextStepItem', 'Next Step'),
      ],
    }),
    defineField({
      name: 'user_research',
      title: 'User Research',
      type: 'object',
      fields: [
        richTextField('method', 'Method'),
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
                richInlineField('name', 'Name'),
                richInlineField('age', 'Age'),
                richInlineField('gender', 'Gender'),
                richInlineField('occupation', 'Occupation'),
                richInlineField('location', 'Location'),
                richInlineField('education', 'Education'),
                richTextField('quote', 'Quote'),
                richTextField('bio', 'Bio'),
                richInlineListField('goals', 'Goals', 'goalItem', 'Goal'),
                richInlineListField('frustrations', 'Frustrations', 'frustrationItem', 'Frustration'),
              ],
              preview: {
                select: {
                  title: 'name',
                  subtitle: 'occupation',
                },
                prepare({title, subtitle}) {
                  return {
                    title: richPreview(title, 'Persona'),
                    subtitle: richPreview(subtitle, ''),
                  }
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
            richTextField('goal', 'Goal'),
            defineField({
              name: 'image',
              title: 'Image URL',
              type: 'string',
            }),
          ],
        }),
        richTextCardArrayField('findings', 'Findings', 'finding', 'Finding'),
      ],
    }),
    defineField({
      name: 'outcomes',
      title: 'Outcomes',
      type: 'object',
      fields: [
        richTextField('intro', 'Intro'),
        richTextField('impact', 'Impact'),
        richTextField('learned', 'Learned'),
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
    richTextCardArrayField('sections', 'Sections', 'section', 'Section', 'body', 'Body'),
    imageListField('gallery', 'Gallery', 'gallery_entry', 'Gallery Item'),
    richInlineListField('nextSteps', 'Next Steps', 'nextStepItem', 'Next Step'),
    richInlineListField('tasks', 'Tasks', 'taskItem', 'Task'),
    richInlineListField('tags', 'Tags', 'tagItem', 'Tag'),
    richInlineField('client', 'Client'),
    richInlineField('industry', 'Industry'),
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
      const parts = [richPreview(subtitle, ''), status].filter(Boolean)
      return {
        title: richPreview(title, 'Untitled project'),
        subtitle: parts.join(' | '),
      }
    },
  },
})
