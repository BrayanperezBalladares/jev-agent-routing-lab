import React from 'react'
import { useTranslation } from 'react-i18next'

export const Hero: React.FC = () => {
  const { t } = useTranslation(['overview'])

  return (
    <header className="hero-section" id="hero" aria-label="Jev Agent Routing Lab Introduction">
      <div className="hero-content-wrapper">
        <div className="hero-badge-row">
          <span className="badge badge-accent">{t('hero.badge1')}</span>
          <span className="badge">{t('hero.badge2')}</span>
          <span className="badge">{t('hero.badge3')}</span>
        </div>

        <h1 className="hero-title">
          {t('hero.title')}
        </h1>

        <p className="hero-subtitle">
          {t('hero.subtitle')}
        </p>

        <p className="hero-description">
          {t('hero.description')}
        </p>
      </div>
    </header>
  )
}

export default Hero
