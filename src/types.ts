export type ListRepositoryResponseData = {
  repositories: Repository[]
  meta: RepositoryResponseMeta
}
type RepositoryResponseMeta = {
  total: number
}
type Repository = {
  registry_name: string
  name: string
  tag_count: number
}

export type ListOfTagsResponseData = {
  tags: Tag[]
  meta: ListOfTagsResponseDataMeta
  links?: ListOfTagsLinks
}
type ListOfTagsLinks = {
  pages: ListOfTagsPages
}
type ListOfTagsPages = {
  next: string
  last: string
}

export type ListOfTagsResponseDataMeta = {
  total: number
}
export type Tag = {
  registry_name: string
  repository: string
  tag: string
  updated_at: string
}

export type RegistryResponseData = {
  registry: Registry
}
type Registry = {
  name: string
}
