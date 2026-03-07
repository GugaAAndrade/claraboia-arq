import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { HomeManifestoPhotosSettings } from '@/components/admin/HomeManifestoPhotosSettings'
import { AboutTeamPhotoSettings } from '@/components/admin/AboutTeamPhotoSettings'
import { ProjectsHeroImageSettings } from '@/components/admin/ProjectsHeroImageSettings'
import { AboutIdentityVisualImageSettings } from '@/components/admin/AboutIdentityVisualImageSettings'
import { ContactHeroImageSettings } from '@/components/admin/ContactHeroImageSettings'

export default async function AdminConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: settings, error: settingsError } = await supabase
    .from('site_settings')
    .select('key, value_text')
    .in('key', [
      'home_manifesto_photo_1_url',
      'home_manifesto_photo_2_url',
      'about_team_photo_url',
      'about_identity_visual_image_url',
      'projects_hero_image_url',
      'contact_hero_image_url',
    ])

  const settingsMap = new Map((settings || []).map((item) => [item.key as string, item.value_text as string]))
  const siteSettingsMissing =
    settingsError?.code === 'PGRST205' ||
    settingsError?.message?.toLowerCase().includes("could not find the table 'public.site_settings'") ||
    false

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-moss md:min-h-screen shrink-0">
        <div className="p-6 border-b border-cream/10">
          <BrandLogo href="/admin" variant="light" imageClassName="w-[150px]" />
        </div>
        <nav className="py-3 md:py-6 flex md:block overflow-x-auto md:overflow-visible border-t border-cream/10 md:border-t-0">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/projetos', label: 'Projetos' },
            { href: '/admin/arquitetas', label: 'Arquitetas' },
            { href: '/admin/contatos', label: 'Contatos' },
            { href: '/admin/configuracoes', label: 'Configurações', active: true },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`block whitespace-nowrap px-4 md:px-6 py-3 text-sm ${item.active ? 'bg-gold/20 text-gold' : 'text-cream/60 hover:text-cream'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 md:px-6 py-4 border-t border-cream/10">
          <Link href="/" target="_blank" className="text-xs text-cream/60 hover:text-gold tracking-wider uppercase">
            Ver site público ↗
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <h2 className="font-serif text-3xl text-moss mb-8">Configurações do site</h2>

        <HomeManifestoPhotosSettings
          initialPhoto1Url={settingsMap.get('home_manifesto_photo_1_url') || ''}
          initialPhoto2Url={settingsMap.get('home_manifesto_photo_2_url') || ''}
          siteSettingsMissing={siteSettingsMissing}
        />

        <ProjectsHeroImageSettings
          initialUrl={settingsMap.get('projects_hero_image_url') || ''}
          siteSettingsMissing={siteSettingsMissing}
        />

        <ContactHeroImageSettings
          initialUrl={settingsMap.get('contact_hero_image_url') || ''}
          siteSettingsMissing={siteSettingsMissing}
        />

        <AboutTeamPhotoSettings
          initialUrl={settingsMap.get('about_team_photo_url') || ''}
          siteSettingsMissing={siteSettingsMissing}
        />

        <AboutIdentityVisualImageSettings
          initialUrl={settingsMap.get('about_identity_visual_image_url') || ''}
          siteSettingsMissing={siteSettingsMissing}
        />
      </main>
    </div>
  )
}
