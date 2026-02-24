<template>
  <div class="legal-view">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('imprint.title') }}</h1>
      </div>
    </section>

    <section class="main-section">
      <div class="section-container">
        <div class="content-card">
          <h2 class="section-title">{{ $t('imprint.operatorTitle') }}</h2>
          <p class="section-text">
            {{ $t('imprint.operatorName') }}<br>
            {{ $t('imprint.operatorStreet') }}<br>
            {{ $t('imprint.operatorCity') }}<br>
            {{ $t('imprint.country') }}
          </p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('imprint.contactTitle') }}</h2>
          <p class="section-text">
            {{ $t('imprint.emailLabel') }}:
            <a href="mailto:info@slopesafe.ch" class="legal-link">info@slopesafe.ch</a><br>
            {{ $t('imprint.websiteLabel') }}:
            <a href="https://slopesafe.ch" class="legal-link" target="_blank">slopesafe.ch</a>
          </p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('imprint.disclaimerTitle') }}</h2>
          <p class="section-text">{{ $t('imprint.disclaimerText') }}</p>
          <p class="section-text disclaimer-extra">{{ $t('imprint.disclaimerText2') }}</p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('imprint.liabilityTitle') }}</h2>
          <p class="section-text">{{ $t('imprint.liabilityText') }}</p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('imprint.copyrightTitle') }}</h2>
          <p class="section-text">{{ $t('imprint.copyrightText') }}</p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('imprint.dataSourcesTitle') }}</h2>
          <p class="section-text">{{ $t('imprint.dataSourcesText') }}</p>
          <ul class="legal-list">
            <li>
              <strong>WSL/SLF</strong> – {{ $t('imprint.dataSourceSLF') }}
              (<a href="https://www.slf.ch" class="legal-link" target="_blank">{{ $t('imprint.dataSourceSLFUrl') }}</a>)
            </li>
            <li>
              <strong>OpenWeatherMap</strong> – {{ $t('imprint.dataSourceWeather') }}
              (<a href="https://openweathermap.org" class="legal-link" target="_blank">{{ $t('imprint.dataSourceWeatherUrl') }}</a>)
            </li>
          </ul>
        </div>

        <router-link :to="{ name: 'support' }" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {{ $t('common.back') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.legal-view {
  width: 100%;
}

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

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
  line-height: 1.2;
}

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

.disclaimer-extra {
  margin-top: var(--spacing-sm);
}

.legal-list {
  margin: var(--spacing-sm) 0 0 0;
  padding-left: var(--spacing-lg);
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.legal-link {
  color: var(--brand-sky-blue);
  text-decoration: none;
}

.legal-link:hover {
  text-decoration: underline;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--color-text-primary);
}

@media (max-width: 1024px) {
  .hero-section { padding: var(--spacing-2xl) var(--spacing-lg); }
  .hero-title { font-size: 2.5rem; }
  .main-section { padding: var(--spacing-xl) var(--spacing-lg); }
}

@media (max-width: 768px) {
  .hero-section { padding: var(--spacing-xl) var(--spacing-md); }
  .hero-title { font-size: 2rem; }
  .main-section { padding: var(--spacing-lg) var(--spacing-md); }
  .content-card { padding: var(--spacing-lg); }
  .section-title { font-size: 1.25rem; }
}

@media (max-width: 360px) {
  .hero-section { padding: var(--spacing-lg) var(--spacing-sm); }
  .hero-title { font-size: 1.5rem; }
  .main-section { padding: var(--spacing-md) var(--spacing-sm); }
  .content-card { padding: var(--spacing-md); }
}
</style>
