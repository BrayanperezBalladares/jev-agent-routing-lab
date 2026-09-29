import React from 'react'
import { useTranslation } from 'react-i18next'

export const ResearchOverview: React.FC = () => {
  const { t } = useTranslation(['overview'])

  const researchAreas = [
    {
      id: 'accuracy',
      title: t('researchAreas.accuracy.title'),
      description: t('researchAreas.accuracy.description'),
      badge: t('researchAreas.accuracy.badge'),
    },
    {
      id: 'stability',
      title: t('researchAreas.stability.title'),
      description: t('researchAreas.stability.description'),
      badge: t('researchAreas.stability.badge'),
    },
    {
      id: 'uncertainty',
      title: t('researchAreas.uncertainty.title'),
      description: t('researchAreas.uncertainty.description'),
      badge: t('researchAreas.uncertainty.badge'),
    },
    {
      id: 'boundary',
      title: t('researchAreas.boundary.title'),
      description: t('researchAreas.boundary.description'),
      badge: t('researchAreas.boundary.badge'),
    },
    {
      id: 'state-rep',
      title: t('researchAreas.stateRep.title'),
      description: t('researchAreas.stateRep.description'),
      badge: t('researchAreas.stateRep.badge'),
    },
  ]

  return (
    <section className="section-container" id="research-overview" aria-label="Research Scope and Focus Areas">
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">{t('researchAreas.badge')}</span>
          <span className="badge">{t('researchAreas.badge2')}</span>
        </div>
        <h2 className="section-title">{t('researchAreas.title')}</h2>
        <p className="section-subtitle">{t('researchAreas.subtitle')}</p>
      </div>

      {/* Research Areas Grid */}
      <div className="hero-research-areas">
        <div className="hero-areas-grid">
          {researchAreas.map((area) => (
            <article key={area.id} className="hero-area-card">
              <div className="hero-area-top">
                <h3 className="hero-area-title">{area.title}</h3>
                <span className="badge">{area.badge}</span>
              </div>
              <p className="hero-area-desc">{area.description}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Methodology Distinction Callout Cards */}
      <div className="hero-distinction-section" style={{ marginTop: '24px' }}>
        <div className="distinction-grid">
          <article className="distinction-card frozen">
            <div className="distinction-header">
              <span className="badge badge-accent">{t('distinction.v1v3Badge')}</span>
              <h3 className="distinction-title">{t('distinction.v1v3Title')}</h3>
            </div>
            <p className="distinction-text">
              {t('distinction.v1v3Text')}
            </p>
            <div className="distinction-footer">
              <span className="distinction-meta">
                {t('distinction.v1v3Footer')}
              </span>
            </div>
          </article>

          <article className="distinction-card diagnostic">
            <div className="distinction-header">
              <span className="badge badge-warning">{t('distinction.v4v8Badge')}</span>
              <h3 className="distinction-title">{t('distinction.v4v8Title')}</h3>
            </div>
            <p className="distinction-text">
              {t('distinction.v4v8Text')}
            </p>
            <div className="distinction-notice">
              <strong className="notice-highlight">{t('distinction.v4v8NoticeLabel')}</strong>{' '}
              {t('distinction.v4v8NoticeText')}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default ResearchOverview
