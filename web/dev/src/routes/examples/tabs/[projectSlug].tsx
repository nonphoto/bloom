import classes from './index.module.css'
import { useParams } from 'solid-start'
import { projects } from '~/data/projects'
import TabsHeader from '~/components/TabsHeader'

export default function UserPage() {
  const params = useParams()
  return (
    <main>
      <TabsHeader />
      <h1 class={classes.h1}>
        {projects.find(project => project.slug === params['projectSlug'])?.title.text}
      </h1>
    </main>
  )
}
