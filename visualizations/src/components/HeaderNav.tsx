import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme'

export const HeaderNav: React.FC = () => {
  const { t, i18n } = useTranslation(['common'])
  const { theme, setTheme } = useTheme()
  const currentLang = i18n.language.startsWith('es') ? 'es' : 'en'

  const handleLanguageChange = (lang: 'en' | 'es') => {
    i18n.changeLanguage(lang)
  }

  return (
    <header className="app-header-nav" aria-label={t('nav.ariaLabel')}>
      <div className="nav-brand-group">
        <span className="badge badge-accent">{t('brand.badge')}</span>
        <div className="brand-text-block">
          <span className="nav-brand-title">{t('brand.title')}</span>
          <span className="nav-brand-sub">{t('brand.monograph')}</span>
        </div>
      </div>

      <nav className="nav-links" aria-label={t('nav.ariaLabel')}>
        <a href="#agent-scenario-sandbox" className="nav-anchor">{t('nav.chapterStory')}</a>
        <a href="#margin-deconstructor" className="nav-anchor">{t('nav.chapterBoundary')}</a>
        <a href="#investigative-timeline" className="nav-anchor">{t('nav.chapterInvestigation')}</a>
        <a href="#uncertainty-governor" className="nav-anchor">{t('nav.chapterArchitecture')}</a>
        <a href="#research-overview" className="nav-anchor">{t('nav.chapterDataLab')}</a>
        <a href="#methodology" className="nav-anchor">{t('nav.chapterMethodology')}</a>
      </nav>

      <div className="nav-controls-group">
        {/* Theme Segmented Control */}
        <div
          className="segmented-control"
          role="group"
          aria-label={t('controls.theme.ariaLabel')}
        >
          <button
            type="button"
            className={`seg-btn ${theme === 'light' ? 'active' : ''}`}
            aria-pressed={theme === 'light'}
            aria-label={t('controls.theme.light')}
            data-theme-value="light"
            onClick={() => setTheme('light')}
          >
            {t('controls.theme.light')}
          </button>
          <button
            type="button"
            className={`seg-btn ${theme === 'dark' ? 'active' : ''}`}
            aria-pressed={theme === 'dark'}
            aria-label={t('controls.theme.dark')}
            data-theme-value="dark"
            onClick={() => setTheme('dark')}
          >
            {t('controls.theme.dark')}
          </button>
          <button
            type="button"
            className={`seg-btn ${theme === 'system' ? 'active' : ''}`}
            aria-pressed={theme === 'system'}
            aria-label={t('controls.theme.system')}
            data-theme-value="system"
            onClick={() => setTheme('system')}
          >
            {t('controls.theme.system')}
          </button>
        </div>

        {/* Language Segmented Control */}
        <div
          className="segmented-control"
          role="group"
          aria-label={t('controls.language.ariaLabel')}
        >
          <button
            type="button"
            className={`seg-btn ${currentLang === 'en' ? 'active' : ''}`}
            aria-pressed={currentLang === 'en'}
            aria-label={t('controls.language.en')}
            data-locale-value="en"
            onClick={() => handleLanguageChange('en')}
          >
            {t('controls.language.en')}
          </button>
          <button
            type="button"
            className={`seg-btn ${currentLang === 'es' ? 'active' : ''}`}
            aria-pressed={currentLang === 'es'}
            aria-label={t('controls.language.es')}
            data-locale-value="es"
            onClick={() => handleLanguageChange('es')}
          >
            {t('controls.language.es')}
          </button>
        </div>
      </div>
    </header>
  )
}

export default HeaderNav
