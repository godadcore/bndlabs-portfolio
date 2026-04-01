import {defineArrayMember, defineField} from 'sanity'

function createLinkAnnotation() {
  return defineArrayMember({
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
  })
}

const sharedMarks = {
  decorators: [
    {title: 'Bold', value: 'strong'},
    {title: 'Italic', value: 'em'},
    {title: 'Underline', value: 'underline'},
    {title: 'Code', value: 'code'},
  ],
  annotations: [createLinkAnnotation()],
}

export const richTextBlocks = [
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
    marks: sharedMarks,
  }),
]

export const richInlineBlocks = [
  defineArrayMember({
    type: 'block',
    styles: [{title: 'Normal', value: 'normal'}],
    lists: [],
    marks: sharedMarks,
  }),
]

export function portableTextToPlainText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (!Array.isArray(value)) {
    return ''
  }

  return value
    .map((block) => {
      if (!block || typeof block !== 'object') {
        return ''
      }

      if (Array.isArray((block as {children?: unknown[]}).children)) {
        return ((block as {children?: Array<{text?: unknown}>}).children || [])
          .map((child) => String(child?.text ?? '').trim())
          .filter(Boolean)
          .join('')
      }

      if (Array.isArray((block as {content?: unknown[]}).content)) {
        return portableTextToPlainText((block as {content?: unknown[]}).content)
      }

      return String(
        (block as {text?: unknown; title?: unknown; label?: unknown; value?: unknown}).text ??
          (block as {title?: unknown}).title ??
          (block as {label?: unknown}).label ??
          (block as {value?: unknown}).value ??
          '',
      ).trim()
    })
    .filter(Boolean)
    .join(' ')
    .trim()
}

export const richTextField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'array',
    ...(description ? {description} : {}),
    of: richTextBlocks,
  })

export const richInlineField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'array',
    ...(description ? {description} : {}),
    of: richInlineBlocks,
  })

function createRichListField(
  name: string,
  title: string,
  itemName: string,
  itemTitle: string,
  description: string | undefined,
  ofBlocks: typeof richTextBlocks | typeof richInlineBlocks,
) {
  return defineField({
    name,
    title,
    type: 'array',
    ...(description ? {description} : {}),
    of: [
      defineArrayMember({
        name: itemName,
        title: itemTitle,
        type: 'object',
        fields: [
          defineField({
            name: 'content',
            title: 'Content',
            type: 'array',
            of: ofBlocks,
          }),
        ],
        preview: {
          select: {
            content: 'content',
          },
          prepare({content}) {
            return {
              title: portableTextToPlainText(content) || itemTitle,
            }
          },
        },
      }),
    ],
  })
}

export const richInlineListField = (
  name: string,
  title: string,
  itemName = `${name}Item`,
  itemTitle = 'Item',
  description?: string,
) => createRichListField(name, title, itemName, itemTitle, description, richInlineBlocks)

export const richTextListField = (
  name: string,
  title: string,
  itemName = `${name}Item`,
  itemTitle = 'Item',
  description?: string,
) => createRichListField(name, title, itemName, itemTitle, description, richTextBlocks)
