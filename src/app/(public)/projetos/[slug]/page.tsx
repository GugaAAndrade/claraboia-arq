import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, UserRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
const toTitleGuess = (slug: string) =>
  decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

interface ProjectGallerySection {
  name: string
  text?: string
  images: string[]
}

interface ProjectDetailField {
  label: string
  value: string
}

interface ProjectSustainabilityCard {
  label?: string
  description?: string
}

interface ProjectCardSection {
  title?: string
  cards?: ProjectSustainabilityCard[]
}

interface ProjectContentSettings {
  custom_typology?: string
  details_title?: string
  technical_title?: string
  logo_url?: string
  explanation_title?: string
  explanation_text?: string
  card_sections?: ProjectCardSection[]
  detail_fields?: ProjectDetailField[]
  technical_fields?: ProjectDetailField[]
  action_buttons?: { label?: string; url?: string }[]
  gallery_sections?: ProjectGallerySection[]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const normalizedSlug = slugify(decodeURIComponent(slug))
  const titleGuess = toTitleGuess(slug)
  const fuzzyPattern = `%${normalizedSlug.replace(/-/g, '%')}%`
  const { data: direct } = await supabase
    .from('projects')
    .select('title, description, slug')
    .ilike('slug', normalizedSlug)
    .maybeSingle()
  let data = direct
  if (!data && titleGuess) {
    const { data: byTitle } = await supabase
      .from('projects')
      .select('title, description, slug')
      .ilike('title', titleGuess)
      .maybeSingle()
    data = byTitle
  }
  if (!data) {
    const { data: fuzzy } = await supabase
      .from('projects')
      .select('title, description, slug')
      .or(`slug.ilike.${fuzzyPattern},title.ilike.${fuzzyPattern}`)
      .limit(1)
      .maybeSingle()
    data = fuzzy
  }
  if (!data) {
    const { data: allProjects } = await supabase.from('projects').select('title, description, slug').limit(200)
    data = (allProjects || []).find((project) => slugify(project.slug || project.title || '') === normalizedSlug) || null
  }
  if (!data) return { title: 'Projeto não encontrado' }
  return {
    title: data.title,
    description: data.description ?? undefined,
  }
}

export default async function ProjetoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const normalizedSlug = slugify(decodeURIComponent(slug))
  const titleGuess = toTitleGuess(slug)
  const fuzzyPattern = `%${normalizedSlug.replace(/-/g, '%')}%`

  const { data: directProject } = await supabase
    .from('projects')
    .select('*')
    .ilike('slug', normalizedSlug)
    .maybeSingle()
  let project = directProject
  if (!project && titleGuess) {
    const { data: byTitle } = await supabase
      .from('projects')
      .select('*')
      .ilike('title', titleGuess)
      .maybeSingle()
    project = byTitle
  }
  if (!project) {
    const { data: fuzzy } = await supabase
      .from('projects')
      .select('*')
      .or(`slug.ilike.${fuzzyPattern},title.ilike.${fuzzyPattern}`)
      .limit(1)
      .maybeSingle()
    project = fuzzy
  }
  if (!project) {
    const { data: allProjects } = await supabase.from('projects').select('*').limit(200)
    project = (allProjects || []).find((item) => slugify(item.slug || item.title || '') === normalizedSlug) || null
  }

  if (!project) notFound()

  const { data: projectContentSetting, error: projectContentSettingError } = await supabase
    .from('site_settings')
    .select('value_text')
    .eq('key', `project_content_${project.id}`)
    .maybeSingle()

  const projectContentSettingsMissing =
    projectContentSettingError?.code === 'PGRST205' ||
    projectContentSettingError?.message?.toLowerCase().includes("could not find the table 'public.site_settings'") ||
    false

  let projectContent: ProjectContentSettings = {}
  if (!projectContentSettingsMissing && projectContentSetting?.value_text) {
    try {
      projectContent = JSON.parse(projectContentSetting.value_text) as ProjectContentSettings
    } catch {
      projectContent = {}
    }
  }

  const customSections = Array.isArray(projectContent.gallery_sections)
    ? projectContent.gallery_sections
      .map((section) => ({
        name: section?.name?.trim() || '',
        text: section?.text?.trim() || '',
        images: Array.isArray(section?.images) ? section.images.filter(Boolean) : [],
      }))
      .filter((section) => section.name || section.text || section.images.length > 0)
    : []
  const explanationTitle = projectContent.explanation_title?.trim() || 'Explicação do projeto'
  const explanationText = projectContent.explanation_text?.trim() || ''
  const explanationBlocks = explanationText
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
  const [explanationLead, ...explanationDetails] = explanationBlocks
  const legacySustainabilityTitle =
    typeof (projectContent as { sustainability_title?: unknown }).sustainability_title === 'string'
      ? ((projectContent as { sustainability_title?: string }).sustainability_title || '').trim()
      : 'Sustentabilidade'
  const legacySustainabilityText =
    typeof (projectContent as { sustainability_text?: unknown }).sustainability_text === 'string'
      ? ((projectContent as { sustainability_text?: string }).sustainability_text || '').trim()
      : ''
  const genericCardSections = Array.isArray(projectContent.card_sections)
    ? projectContent.card_sections
      .map((section) => ({
        title: section?.title?.trim() || '',
        cards: Array.isArray(section?.cards)
          ? section.cards
            .map((card) => ({
              label: card?.label?.trim() || '',
              description: card?.description?.trim() || '',
            }))
            .filter((card) => card.label || card.description)
          : [],
      }))
      .filter((section) => section.title || section.cards.length > 0)
    : []
  const sectionsFromLegacySustainability =
    genericCardSections.length > 0
      ? genericCardSections
      : (
        Array.isArray((projectContent as { sustainability_cards?: ProjectSustainabilityCard[] }).sustainability_cards)
          ? [{
            title: legacySustainabilityTitle || 'Sustentabilidade',
            cards: ((projectContent as { sustainability_cards?: ProjectSustainabilityCard[] }).sustainability_cards || [])
              .map((card) => ({
                label: card?.label?.trim() || '',
                description: card?.description?.trim() || '',
              }))
              .filter((card) => card.label || card.description),
          }].filter((section) => section.cards.length > 0)
          : (legacySustainabilityText
            ? [{ title: legacySustainabilityTitle || 'Sustentabilidade', cards: [{ label: '', description: legacySustainabilityText }] }]
            : [])
      )
  const customTypology = projectContent.custom_typology?.trim() || ''
  const detailsTitle = projectContent.details_title?.trim() || 'Detalhes'
  const technicalTitle = projectContent.technical_title?.trim() || 'Ficha técnica'
  const logoUrl = projectContent.logo_url?.trim() || ''
  const customDetailFields = Array.isArray(projectContent.detail_fields)
    ? projectContent.detail_fields
      .map((field) => ({
        label: field?.label?.trim() || '',
        value: field?.value?.trim() || '',
      }))
      .filter((field) => field.label && field.value)
    : []
  const detailFields = customDetailFields
  const customTechnicalFields = Array.isArray(projectContent.technical_fields)
    ? projectContent.technical_fields
      .map((field) => ({
        label: field?.label?.trim() || '',
        value: field?.value?.trim() || '',
      }))
      .filter((field) => field.label && field.value)
    : []
  const actionButtons = Array.isArray(projectContent.action_buttons)
    ? projectContent.action_buttons
      .map((button) => ({
        label: button?.label?.trim() || '',
        url: button?.url?.trim() || '',
      }))
      .filter((button) => button.label && button.url)
    : []

  const { data: mainArchitect } = project.architect_id
    ? await supabase.from('architects').select('*').eq('id', project.architect_id).maybeSingle()
    : { data: null }

  const { data: projectLinks } = await supabase
    .from('project_architects')
    .select('architect_id')
    .eq('project_id', project.id)

  const linkedArchitectIds = (projectLinks || [])
    .map((item) => item.architect_id)
    .filter(Boolean) as string[]

  const { data: linkedArchitectRows } = linkedArchitectIds.length
    ? await supabase.from('architects').select('*').in('id', linkedArchitectIds).order('name')
    : { data: [] }

  const linkedArchitects = (linkedArchitectRows || []) as {
    id: string
    name: string
    photo_url?: string | null
    specialty?: string | null
  }[]
  const projectArchitects = linkedArchitects.length
    ? linkedArchitects
    : (mainArchitect ? [mainArchitect] : [])

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-[#FFFDF8] py-4 px-6 border-b border-wine/10">
        <div className="max-w-7xl mx-auto">
          <Link href="/projetos" className="inline-flex items-center gap-2 text-sm text-moss/50 hover:text-wine transition-colors">
            <ArrowLeft size={14} />
            Voltar aos projetos
          </Link>
        </div>
      </div>

      {/* Hero do projeto */}
      <section className="relative min-h-[65vh] bg-moss overflow-hidden flex items-end">
        {project.cover_url ? (
          <Image
            src={project.cover_url}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-wine/60 to-moss" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
        <div className="relative w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex flex-col bg-transparent border-0 backdrop-blur-0 p-0 min-w-0">
              {logoUrl && (
                <div className="relative h-[90px] md:h-[140px] w-[280px] md:w-[380px] lg:w-[440px]">
                  <Image
                    src={logoUrl}
                    alt={`Logomarca de ${project.title}`}
                    fill
                    className="object-contain object-left drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-6 bg-[#FFFDF8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Descrição */}
          <div className="lg:col-span-2">
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.35em] uppercase text-wine/70 mb-5">{explanationTitle}</p>
              {explanationText ? (
                explanationBlocks.length > 1 ? (
                  <>
                    <p className="font-serif text-2xl md:text-3xl text-moss leading-[1.35] mb-7 text-justify">
                      {explanationLead}
                    </p>
                    <div className="space-y-5">
                      {explanationDetails.map((paragraph, index) => (
                        <p key={index} className="text-moss/75 text-[16px] leading-[1.9] text-justify">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="font-serif text-2xl md:text-3xl text-moss leading-[1.35] mb-7 text-justify">
                    {explanationText}
                  </p>
                )
              ) : (
                <p className="text-moss/60 text-lg leading-relaxed text-justify">
                  Em breve adicionaremos uma narrativa completa deste projeto.
                </p>
              )}
            </div>

            {sectionsFromLegacySustainability.length > 0 && (
              <div className="space-y-10 mb-14">
                {sectionsFromLegacySustainability.map((section, sectionIndex) => (
                  <div key={`${section.title}-${sectionIndex}`}>
                    {section.title && (
                      <p className="text-[10px] tracking-[0.35em] uppercase text-wine/70 mb-5">{section.title}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.cards.map((card, index) => (
                        <div
                          key={`${card.label}-${index}`}
                          className="border border-moss/15 bg-moss/6 px-5 py-4 transition-colors hover:bg-moss/10"
                        >
                          {card.label && (
                            <p className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase text-gold mb-2">
                              {card.label}
                            </p>
                          )}
                          {card.description && (
                            <p className="text-moss/80 text-[14px] leading-[1.7] text-justify">{card.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {actionButtons.length > 0 && (
              <div className="mb-14 flex flex-wrap gap-3">
                {actionButtons.map((button, index) => (
                  <a
                    key={`${button.label}-${index}`}
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-wine text-cream text-[11px] tracking-[0.22em] uppercase hover:bg-moss transition-colors"
                  >
                    {button.label}
                  </a>
                ))}
              </div>
            )}

            {customSections.length > 0 && (
              <div className="space-y-14">
                {customSections.map((section, sectionIndex) => (
                  <div key={`${section.name}-${sectionIndex}`}>
                    {section.name && (
                      <p className="text-[10px] tracking-[0.35em] uppercase text-wine/70 mb-5">{section.name}</p>
                    )}
                    {section.text && (
                      <p className="text-moss/70 text-[15px] leading-[1.85] mb-5 text-justify">{section.text}</p>
                    )}
                    {section.images.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {section.images.map((url, imageIndex) => (
                          <div key={url + imageIndex} className={`overflow-hidden bg-stone-100 ${imageIndex === 0 ? 'sm:col-span-2' : ''}`}>
                            <div className={`relative ${imageIndex === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                              <Image
                                src={url}
                                alt={`${project.title} — ${section.name || 'seção'} ${imageIndex + 1}`}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Mapa */}
            {project.map_embed_url && (
              <div className="mt-14">
                <p className="text-[10px] tracking-[0.35em] uppercase text-wine/70 mb-5">Localização no mapa</p>
                <div className="border border-stone-200 bg-white">
                  <div className="relative aspect-[16/9]">
                    <iframe
                      src={project.map_embed_url}
                      className="absolute inset-0 w-full h-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Mapa do projeto ${project.title}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div className="lg:col-span-1">
            <div className="bg-moss/5 p-8 sticky top-[90px]">
              <h3 className="font-serif text-xl text-moss mb-6">{detailsTitle}</h3>

              {detailFields.length > 0 && (
                <div className="border-t border-gold/20 pt-6 mb-8">
                  <div className="space-y-3 text-sm">
                    {detailFields.map((field, index) => (
                      <div key={`${field.label}-${index}`}>
                        <p className="text-moss/45 uppercase tracking-wider text-[10px]">{field.label}</p>
                        <p className="text-moss text-justify">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detailFields.length === 0 && (
                <div className="border-t border-gold/20 pt-6 mb-8">
                  <p className="text-sm text-moss/60">
                    Nenhum detalhe cadastrado para este projeto.
                  </p>
                </div>
              )}

              <h3 className="font-serif text-xl text-moss mb-6">{technicalTitle}</h3>

              {customTechnicalFields.length > 0 && (
                <div className="border-t border-gold/20 pt-6 mb-8">
                  <div className="space-y-3 text-sm">
                    {customTechnicalFields.map((field, index) => (
                      <div key={`${field.label}-${index}`}>
                        <p className="text-moss/45 uppercase tracking-wider text-[10px]">{field.label}</p>
                        <p className="text-moss text-justify">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {customTechnicalFields.length === 0 && (
                <div className="border-t border-gold/20 pt-6 mb-8">
                  <p className="text-sm text-moss/60">
                    Nenhum campo de ficha técnica cadastrado.
                  </p>
                </div>
              )}

              {/* Arquitetas */}
              {projectArchitects.length > 0 && (
                <div className="border-t border-gold/20 pt-6 mb-8">
                  <p className="text-xs tracking-widest uppercase text-gold mb-3">
                    {projectArchitects.length > 1 ? 'Arquitetas responsáveis' : 'Arquiteta responsável'}
                  </p>
                  <div className="flex flex-col gap-3">
                    {projectArchitects.map((architect: {
                      id: string
                      name: string
                      photo_url?: string | null
                      specialty?: string | null
                    }) => (
                      <div key={architect.id} className="flex items-center gap-3">
                        {architect.photo_url ? (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                            <Image
                              src={architect.photo_url}
                              alt={architect.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-wine/10 border border-wine/20 flex items-center justify-center font-serif text-wine shrink-0">
                            {architect.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-moss">{architect.name}</p>
                          {architect.specialty && (
                            <p className="text-xs text-moss/50">{architect.specialty}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {projectArchitects.length === 0 && (
                <div className="border-t border-gold/20 pt-6 mb-8">
                  <p className="text-xs tracking-widest uppercase text-gold mb-3">Equipe</p>
                  <div className="flex items-center gap-2 text-moss/65">
                    <UserRound size={14} />
                    <p className="text-sm">Detalhes da equipe podem ser vinculados no admin.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
