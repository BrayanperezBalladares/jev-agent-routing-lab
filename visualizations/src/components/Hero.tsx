import React from 'react'

export const Hero: React.FC = () => {
  return (
    <header className="hero-section" id="hero" aria-label="Jev Agent Routing Lab Introduction">
      <div className="hero-content-wrapper">
        <div className="hero-badge-row">
          <span className="badge badge-accent">Research Lab</span>
          <span className="badge badge-purple">Autonomous Agent Systems</span>
          <span className="badge">Typesafe Semantic Routing</span>
        </div>

        <h1 className="hero-title">
          How Does a Coding Agent Decide What to Do Next?
        </h1>

        <p className="hero-subtitle">
          Jev Agent Routing Lab studies semantic routing, stability, and decision boundaries
          across five discrete software-engineering actions.
        </p>

        <p className="hero-description">
          When an autonomous agent receives an ambiguous bug report or complex task, choosing the wrong tool
          wastes tokens, triggers unnecessary execution loops, or interrupts developers prematurely.
          Experience the routing dilemma firsthand below before exploring the empirical research.
        </p>
      </div>
    </header>
  )
}

export default Hero
