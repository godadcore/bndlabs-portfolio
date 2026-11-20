import {type FieldProps, useFormValue} from 'sanity'

type PracticeTitles = Record<string, string>

export function PracticeField(props: FieldProps) {
  const discipline = useFormValue(['discipline'])
  const titles = (props.schemaType.options as {practiceTitles?: PracticeTitles} | undefined)
    ?.practiceTitles
  const key = typeof discipline === 'string' ? discipline : ''
  const title = titles?.[key] || props.title
  return props.renderDefault({...props, title})
}
