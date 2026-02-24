<template>
  <div class="about-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">SlopeSafe</h1>
        <p class="hero-subtitle">{{ $t('about.subtitle') }}</p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-section">
      <div class="section-container">

        <!-- What is SlopeSafe -->
        <div class="content-card">
          <h2 class="section-title">{{ $t('about.whatTitle') }}</h2>
          <p class="section-text">{{ $t('about.whatText') }}</p>
        </div>

        <!-- Features -->
        <div class="content-card">
          <h2 class="section-title">{{ $t('about.featuresTitle') }}</h2>
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 class="feature-title">{{ $t('about.feature1Title') }}</h3>
              <p class="feature-text">{{ $t('about.feature1Text') }}</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
              </div>
              <h3 class="feature-title">{{ $t('about.feature2Title') }}</h3>
              <p class="feature-text">{{ $t('about.feature2Text') }}</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>
              <h3 class="feature-title">{{ $t('about.feature3Title') }}</h3>
              <p class="feature-text">{{ $t('about.feature3Text') }}</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h3 class="feature-title">{{ $t('about.feature4Title') }}</h3>
              <p class="feature-text">{{ $t('about.feature4Text') }}</p>
            </div>
          </div>
        </div>

        <!-- Data Sources -->
        <div class="content-card">
          <h2 class="section-title">{{ $t('about.dataTitle') }}</h2>
          <p class="section-text">{{ $t('about.dataText') }}</p>
          <div class="data-sources">
            <div class="data-source-item">
              <strong>WSL/SLF</strong>
              <span>{{ $t('about.dataSLF') }}</span>
            </div>
            <div class="data-source-item">
              <strong>OpenWeatherMap</strong>
              <span>{{ $t('about.dataWeather') }}</span>
            </div>
          </div>
        </div>

        <!-- Free & Open -->
        <div class="content-card">
          <h2 class="section-title">{{ $t('about.freeTitle') }}</h2>
          <p class="section-text">{{ $t('about.freeText') }}</p>
        </div>

        <!-- CTA -->
        <div class="content-card cta-card">
          <h2 class="section-title">{{ $t('about.ctaTitle') }}</h2>
          <p class="section-text">{{ $t('about.ctaText') }}</p>
          <div class="cta-buttons">
            <router-link :to="{ name: 'home' }" class="cta-button primary">
              {{ $t('about.ctaExplore') }}
            </router-link>
            <router-link :to="{ name: 'support' }" class="cta-button secondary">
              {{ $t('about.ctaContact') }}
            </router-link>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-view {
  width: 100%;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(169deg, rgba(26, 54, 93, 0.85) 0%, rgba(42, 72, 100, 0.85) 100%),
              url('/back.png') center/cover no-repeat;
  padding: var(--spacing-3xl) var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-logo {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Main Section */
.main-section {
  padding: var(--spacing-2xl) var(--spacing-xl);
  background-color: var(--color-background);
}

.section-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Content Cards */
.content-card {
  background-color: var(--card-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-xl);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.section-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.feature-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background-color: rgba(26, 54, 93, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a365d;
  margin-bottom: var(--spacing-xs);
}

.feature-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.feature-text {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Data Sources */
.data-sources {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.data-source-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(26, 54, 93, 0.04);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

.data-source-item strong {
  color: var(--color-text-primary);
  min-width: 140px;
}

/* CTA */
.cta-card {
  text-align: center;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.cta-button {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.cta-button:hover {
  transform: translateY(-1px);
}

.cta-button.primary {
  background-color: #1a365d;
  color: #FFFFFF;
}

.cta-button.primary:hover {
  background-color: #2a4864;
}

.cta-button.secondary {
  background-color: rgba(26, 54, 93, 0.08);
  color: #1a365d;
}

.cta-button.secondary:hover {
  background-color: rgba(26, 54, 93, 0.14);
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-section {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .main-section {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .main-section {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .content-card {
    padding: var(--spacing-lg);
  }

  .section-title {
    font-size: 1.25rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .data-source-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .data-source-item strong {
    min-width: auto;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 360px) {
  .hero-section {
    padding: var(--spacing-lg) var(--spacing-sm);
  }

  .hero-logo {
    width: 60px;
    height: 60px;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .main-section {
    padding: var(--spacing-md) var(--spacing-sm);
  }

  .content-card {
    padding: var(--spacing-md);
  }
}
</style>
