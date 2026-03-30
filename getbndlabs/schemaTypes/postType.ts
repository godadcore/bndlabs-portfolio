import {defineField, defineType} from 'sanity'

const stringListField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{type: 'string'}],
  })

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

export const postType = defineType({
  name: 'post',
  title: 'Blog Posts',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'date',
      title: 'Published Date',
      type: 'datetime',
    }),
    defineField({
      name: 'read_time',
      title: 'Read Time',
      type: 'string',
    }),
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
    }),
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
        defineField({
          name: 'name',
          title: 'Name',
          type: 'string',
        }),
        defineField({
          name: 'initials',
          title: 'Initials',
          type: 'string',
        }),
        externalUrlField('avatar_url', 'Avatar URL'),
      ],
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
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'text',
            },
          },
        }),
        defineField({
          name: 'textBlock',
          title: 'Text',
          type: 'object',
          fields: [
            defineField({
              name: 'html',
              title: 'HTML',
              type: 'text',
              rows: 6,
              description: 'Optional raw HTML if you want to preserve custom paragraph markup.',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 6,
              description: 'Plain text alternative. The frontend will convert paragraphs automatically.',
            }),
          ],
          preview: {
            select: {
              title: 'body',
              subtitle: 'html',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Text block',
                subtitle: subtitle ? 'Uses HTML' : 'Plain text',
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
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
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
                    defineField({
                      name: 'caption',
                      title: 'Caption',
                      type: 'string',
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'alt',
                      subtitle: 'url',
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'alt',
              subtitle: 'url',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Image block',
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
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'url',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Video block',
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
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'alt',
              subtitle: 'url',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'GIF block',
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
            defineField({
              name: 'language',
              title: 'Language',
              type: 'string',
            }),
            defineField({
              name: 'filename',
              title: 'Filename',
              type: 'string',
            }),
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
                title: title || 'Code block',
                subtitle,
              }
            },
          },
        }),
        defineField({
          name: 'tableBlock',
          title: 'Table',
          type: 'object',
          fields: [
            stringListField('headers', 'Headers'),
            defineField({
              name: 'rows',
              title: 'Rows',
              type: 'array',
              of: [
                defineField({
                  name: 'table_row',
                  title: 'Row',
                  type: 'object',
                  fields: [stringListField('cells', 'Cells')],
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
            }),
          ],
          preview: {
            select: {
              title: 'headers.0',
            },
            prepare({title}) {
              return {
                title: title || 'Table block',
              }
            },
          },
        }),
        defineField({
          name: 'audioBlock',
          title: 'Audio',
          type: 'object',
          fields: [externalUrlField('url', 'Audio URL')],
          preview: {
            select: {
              title: 'url',
            },
            prepare({title}) {
              return {
                title: title || 'Audio block',
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
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 4,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'body',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Callout block',
                subtitle,
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
          type: 'string',
        }),
        defineField({
          name: 'slug',
          title: 'Slug',
          type: 'string',
        }),
        defineField({
          name: 'excerpt',
          title: 'Excerpt',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'date',
          title: 'Published Date',
          type: 'datetime',
        }),
        defineField({
          name: 'read_time',
          title: 'Read Time',
          type: 'string',
        }),
        defineField({
          name: 'tag',
          title: 'Tag',
          type: 'string',
        }),
        externalUrlField('thumb_url', 'Thumbnail URL'),
        defineField({
          name: 'author',
          title: 'Author',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
            }),
            defineField({
              name: 'initials',
              title: 'Initials',
              type: 'string',
            }),
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
        title,
        subtitle: subtitle || 'Blog post',
      }
    },
  },
})
