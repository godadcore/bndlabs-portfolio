import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {practiceTemplates, structure} from './structure'
import './studio.css'

export default defineConfig({
  name: 'default',
  title: 'Bndlabs',

  projectId: 'u9ziwy8t',
  dataset: 'production',

  plugins: [structureTool({structure})],

  document: {
    newDocumentOptions: (previous) =>
      previous.filter((item) => item.templateId !== 'caseStudy' && item.templateId !== 'project'),
  },

  schema: {
    types: schemaTypes,
    templates: (previous) => [...previous, ...practiceTemplates],
  },
})
