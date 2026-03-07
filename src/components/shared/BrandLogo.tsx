import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  href?: string
  variant?: 'burgundy' | 'light'
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function BrandLogo({
  href = '/',
  variant = 'burgundy',
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const src = variant === 'light' ? '/brand/logo-light.png' : '/brand/logo-burgundy.png'

  return (
    <Link href={href} className={cn('inline-flex items-center leading-none', className)} aria-label="Claraboia Arquitetura">
      <Image
        src={src}
        alt="Claraboia Arquitetura"
        width={420}
        height={120}
        priority={priority}
        className={cn('block h-auto w-[200px] md:w-[240px]', imageClassName)}
      />
    </Link>
  )
}
