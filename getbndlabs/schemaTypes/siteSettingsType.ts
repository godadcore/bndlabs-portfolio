import {defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'behance',
      title: 'Behance',
      type: 'string',
    }),
    defineField({
      name: 'x',
      title: 'X',
      type: 'string',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'string',
    }),
    defineField({
      name: 'whatsapp_number',
      title: 'WhatsApp Number',
      type: 'string',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn',
      type: 'string',
    }),
    defineField({
      name: 'tiktok',
      title: 'TikTok',
      type: 'string',
    }),
    defineField({
      name: 'splashMessage',
      title: 'Splash message',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'splashImage',
      title: 'Splash image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'intro',
      title: 'Homepage introduction',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'professionalTitles',
      title: 'Professional titles',
      type: 'string',
    }),
    defineField({
      name: 'aboutIntro',
      title: 'About introduction',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'aboutBiography',
      title: 'About biography',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'heroImages',
      title: 'Homepage image frames',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'profilePhotos',
      title: 'Profile photographs',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'experience',
      title: 'Experience',
      type: 'array',
      of: [
        defineField({
          name: 'experienceItem',
          title: 'Role',
          type: 'object',
          fields: [
            defineField({name: 'dates', title: 'Dates', type: 'string'}),
            defineField({name: 'place', title: 'Place', type: 'string'}),
            defineField({name: 'role', title: 'Role', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [
        defineField({
          name: 'educationItem',
          title: 'Study',
          type: 'object',
          fields: [
            defineField({name: 'dates', title: 'Dates', type: 'string'}),
            defineField({name: 'place', title: 'Study', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'clips',
      title: 'Video clips',
      type: 'array',
      of: [
        defineField({
          name: 'clipItem',
          title: 'Clip',
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string'}),
            defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3}),
            defineField({name: 'sourceContext', title: 'Source context', type: 'string'}),
            defineField({name: 'platform', title: 'Platform', type: 'string'}),
            defineField({name: 'details', title: 'Clip details', type: 'string'}),
            defineField({name: 'watchUrl', title: 'Watch URL', type: 'url'}),
            defineField({name: 'videoUrl', title: 'Playable video URL', type: 'url'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'tools',
      title: 'Tools',
      type: 'array',
      of: [
        defineField({
          name: 'toolItem',
          title: 'Tool',
          type: 'object',
          fields: [
            defineField({name: 'name', title: 'Name', type: 'string'}),
            defineField({name: 'category', title: 'Category', type: 'string'}),
            defineField({name: 'description', title: 'Short description', type: 'string'}),
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})
