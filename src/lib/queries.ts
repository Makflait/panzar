import { cache } from 'react'
import { db } from './db'

export const getProject = cache(async (id: string) => {
  return db.project.findUnique({
    where: { id },
    select: { id: true, name: true, apiKey: true, description: true, domain: true },
  })
})
