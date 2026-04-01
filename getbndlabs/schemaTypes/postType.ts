import {defineField, defineType} from 'sanity'
import {
  portableTextToPlainText,
  richInlineField,
  richInlineListField,
  richTextBlocks,
  richTextField,
} from './richTextFields'

const externalUrlField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'url',
    ...(description ? {description} : {}),
    validation: (Rule) =>
      Rule.uri({
        allowRelative: false,
        scheme: ['https', 'http'],
      }),
  })

const richTitlePreview = (value: unknown, fallback: string) =>
  portableTextToPlainText(value) || fallback

export const postType = defineType({
  name: 'post',
  title: 'Blog Posts',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'array',
      of: richTextBlocks,
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
    richTextField('excerpt', 'Excerpt'),
    defineField({
      name: 'date',
      title: 'Published Date',
      type: 'datetime',
    }),
    richInlineField('read_time', 'Read Time'),
    richInlineField('tag', 'Tag'),
    externalUrlField(
      'thumb_url',
      'Thumbnail URL',
      'Optional remote image URL used for the blog card and share preview.',
    ),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'object',
      fields: [
        richInlineField('name', 'Name'),
        richInlineField('initials', 'Initials'),
        externalUrlField('avatar_url', 'Avatar URL'),
      ],
      preview: {
        select: {
          title: 'name',
          subtitle: 'initials',
        },
        prepare({title, subtitle}) {
          return {
            title: richTitlePreview(title, 'Author'),
            subtitle: richTitlePreview(subtitle, ''),
          }
        },
      },
    }),
    defineField({
      name: 'content_blocks',
      title: 'Content Blocks',
      type: 'array',
      of: [
        defineField({
          name: 'headingBlock',
          title: 'Heading',
          type: 'object',
          fields: [richInlineField('text', 'Text')],
          preview: {
            select: {
              title: 'text',
            },
            prepare({title}) {
              return {
                title: richTitlePreview(title, 'Heading'),
              }
            },
          },
        }),
        defineField({
          name: 'textBlock',
          title: 'Text',
          type: 'object',
          fields: [
            richTextField('content', 'Content'),
            defineField({
              name: 'html',
              title: 'Legacy HTML',
              type: 'text',
              rows: 6,
              hidden: true,
            }),
            defineField({
              name: 'body',
              title: 'Legacy Body',
              type: 'text',
              rows: 6,
              hidden: true,
            }),
          ],
          preview: {
            select: {
              title: 'content',
              subtitle: 'html',
            },
            prepare({title, subtitle}) {
              return {
                title: richTitlePreview(title, 'Text block'),
                subtitle: subtitle ? 'Uses legacy HTML fallback' : 'Rich text',
              }
            },
          },
        }),
        defineField({
          name: 'imageBlock',
          title: 'Image',
          type: 'object',
          fields: [
            externalUrlField('url', 'Image URL'),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
            richInlineField('caption', 'Caption'),
            defineField({
              name: 'images',
              title: 'Image Grid',
              type: 'array',
              of: [
                defineField({
                  name: 'image_item',
                  title: 'Image',
                  type: 'object',
                  fields: [
                    externalUrlField('url', 'Image URL'),
                    defineField({
                      name: 'alt',
                      title: 'Alt Text',
                      type: 'string',
                    }),
                    richInlineField('caption', 'Caption'),
                  ],
                  preview: {
                    select: {
                      title: 'caption',
                      subtitle: 'url',
                    },
                    prepare({title, subtitle}) {
                      return {
                        title: richTitlePreview(title, 'Image'),
                        subtitle,
                      }
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'url',
            },
            prepare({title, subtitle}) {
              return {
                title: richTitlePreview(title, 'Image block'),
                subtitle: subtitle || 'Image grid',
              }
            },
          },
        }),
        defineField({
          name: 'videoBlock',
          title: 'Video',
          type: 'object',
          fields: [
            externalUrlField('url', 'Video URL'),
            richInlineField('caption', 'Caption'),
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'url',
            },
            prepare({title, subtitle}) {
              return {
                title: richTitlePreview(title, 'Video block'),
                subtitle,
              }
            },
          },
        }),
        defineField({
          name: 'gifBlock',
          title: 'GIF',
          type: 'object',
          fields: [
            externalUrlField('url', 'GIF URL'),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
            richInlineField('caption', 'Caption'),
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'url',
            },
            prepare({title, subtitle}) {
              return {
                title: richTitlePreview(title, 'GIF block'),
                subtitle,
              }
            },
          },
        }),
        defineField({
          name: 'codeBlock',
          title: 'Code',
          type: 'object',
          fields: [
            richInlineField('language', 'Language'),
            richInlineField('filename', 'Filename'),
            defineField({
              name: 'code',
              title: 'Code',
              type: 'text',
              rows: 10,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'filename',
              subtitle: 'language',
            },
            prepare({title, subtitle}) {
              return {
                title: richTitlePreview(title, 'Code block'),
                subtitle: richTitlePreview(subtitle, ''),
              }
            },
          },
        }),
        defineField({
          name: 'tableBlock',
          title: 'Table',
          type: 'object',
          fields: [
            richInlineListField('headers', 'Headers', 'header', 'Header'),
            defineField({
              name: 'rows',
              title: 'Rows',
              type: 'array',
              of: [
                defineField({
                  name: 'table_row',
                  title: 'Row',
                  type: 'object',
                  fields: [richInlineListField('cells', 'Cells', 'cell', 'Cell')],
                  preview: {
                    select: {
                      title: 'cells',
                    },
                    prepare({title}) {
                      return {
                        title: richTitlePreview(title, 'Table row'),
                      }
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'headers',
            },
            prepare({title}) {
              return {
                title: richTitlePreview(title, 'Table block'),
              }
            },
          },
        }),
        defineField({
          name: 'audioBlock',
          title: 'Audio',
          type: 'object',
          fields: [
            externalUrlField('url', 'Audio URL'),
            richInlineField('caption', 'Caption'),
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'url',
            },
            prepare({title, subtitle}) {
              return {
                title: richTitlePreview(title, 'Audio block'),
                subtitle,
              }
            },
          },
        }),
        defineField({
          name: 'calloutBlock',
          title: 'Callout',
          type: 'object',
          fields: [
            defineField({
              name: 'emoji',
              title: 'Emoji',
              type: 'string',
            }),
            richInlineField('title', 'Title'),
            richTextField('body', 'Body'),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'body',
            },
            prepare({title, subtitle}) {
              return {
                title: richTitlePreview(title, 'Callout block'),
                subtitle: richTitlePreview(subtitle, ''),
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'next_post',
      title: 'Next Post',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'array',
          of: richTextBlocks,
        }),
        defineField({
          name: 'slug',
          title: 'Slug',
          type: 'slug',
          options: {
            source: (doc) => portableTextToPlainText(doc?.title),
          },
        }),
        richTextField('excerpt', 'Excerpt'),
        defineField({
          name: 'date',
          title: 'Published Date',
          type: 'datetime',
        }),
        richInlineField('read_time', 'Read Time'),
        richInlineField('tag', 'Tag'),
        externalUrlField('thumb_url', 'Thumbnail URL'),
        defineField({
          name: 'author',
          title: 'Author',
          type: 'object',
          fields: [
            richInlineField('name', 'Name'),
            richInlineField('initials', 'Initials'),
            externalUrlField('avatar_url', 'Avatar URL'),
          ],
        }),
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'tag',
    },
    prepare({title, subtitle}) {
      return {
        title: richTitlePreview(title, 'Untitled post'),
        subtitle: richTitlePreview(subtitle, 'Blog post'),
      }
    },
  },
})
