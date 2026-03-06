export type Typology = 'Residencial' | 'Comercial' | 'Interiores' | 'Urbanismo' | 'Outros'

export interface Architect {
  id: string
  name: string
  bio: string | null
  specialty: string | null
  photo_url: string | null
  instagram: string | null
  created_at: string
}

export interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  typology: Typology | null
  year: number | null
  location: string | null
  cover_url: string | null
  images: string[]
  floor_plans: string[]
  client_name: string | null
  area_m2: number | null
  project_scope: string | null
  project_status: string | null
  materials: string | null
  team_notes: string | null
  map_embed_url: string | null
  model_3d_url: string | null // reservado para v2
  architect_id: string | null
  featured: boolean
  created_at: string
  architects?: Architect // join
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  created_at: string
}
