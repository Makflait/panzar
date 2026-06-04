import { notFound } from 'next/navigation'
import { getProject } from '@/lib/queries'
import { Sidebar } from '@/components/layout/sidebar'

type Props = {
  children: React.ReactNode
  params: { projectId: string }
}

export default async function ProjectLayout({ children, params }: Props) {
  const project = await getProject(params.projectId)
  if (!project) notFound()

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      <Sidebar projectId={project.id} projectName={project.name} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  )
}
