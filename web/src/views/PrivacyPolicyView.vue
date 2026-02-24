<template>
  <div class="legal-view">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('privacy.title') }}</h1>
        <p class="hero-subtitle">{{ $t('privacy.lastUpdated') }}: 24.02.2026</p>
      </div>
    </section>

    <section class="main-section">
      <div class="section-container">
        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.responsibleTitle') }}</h2>
          <p class="section-text">
            SlopeSafe<br>
            info@slopesafe.ch
          </p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.overviewTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.overviewText') }}</p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.dataCollectionTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.dataCollectionText') }}</p>
          <ul class="legal-list">
            <li>{{ $t('privacy.dataItem1') }}</li>
            <li>{{ $t('privacy.dataItem2') }}</li>
            <li>{{ $t('privacy.dataItem3') }}</li>
            <li>{{ $t('privacy.dataItem4') }}</li>
          </ul>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.legalBasisTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.legalBasisText') }}</p>
          <ul class="legal-list">
            <li>{{ $t('privacy.legalBasisItem1') }}</li>
            <li>{{ $t('privacy.legalBasisItem2') }}</li>
            <li>{{ $t('privacy.legalBasisItem3') }}</li>
          </ul>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.purposeTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.purposeText') }}</p>
          <ul class="legal-list">
            <li>{{ $t('privacy.purposeItem1') }}</li>
            <li>{{ $t('privacy.purposeItem2') }}</li>
            <li>{{ $t('privacy.purposeItem3') }}</li>
          </ul>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.storageTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.storageText') }}</p>
          <ul class="legal-list">
            <li>{{ $t('privacy.storageItem1') }}</li>
            <li>{{ $t('privacy.storageItem2') }}</li>
            <li>{{ $t('privacy.storageItem3') }}</li>
          </ul>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.hostingTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.hostingText') }}</p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.thirdPartyTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.thirdPartyText') }}</p>
          <ul class="legal-list">
            <li><strong>WSL/SLF</strong> – {{ $t('privacy.thirdPartySLF') }}</li>
            <li><strong>OpenWeatherMap</strong> – {{ $t('privacy.thirdPartyWeather') }}</li>
          </ul>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.securityTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.securityText') }}</p>
          <ul class="legal-list">
            <li>{{ $t('privacy.securityItem1') }}</li>
            <li>{{ $t('privacy.securityItem2') }}</li>
            <li>{{ $t('privacy.securityItem3') }}</li>
          </ul>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.cookiesTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.cookiesText') }}</p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.profilingTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.profilingText') }}</p>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.rightsTitle') }}</h2>
          <p class="section-text">{{ $t('privacy.rightsText') }}</p>
          <ul class="legal-list">
            <li>{{ $t('privacy.rightsItem1') }}</li>
            <li>{{ $t('privacy.rightsItem2') }}</li>
            <li>{{ $t('privacy.rightsItem3') }}</li>
            <li>{{ $t('privacy.rightsItem4') }}</li>
            <li>{{ $t('privacy.rightsItem5') }}</li>
            <li>{{ $t('privacy.rightsItem6') }}</li>
          </ul>
        </div>

        <div class="content-card">
          <h2 class="section-title">{{ $t('privacy.contactTitle') }}</h2>
          <p class="section-text">
            {{ $t('privacy.contactText') }}<br>
            <a href="mailto:info@slopesafe.ch" class="legal-link">info@slopesafe.ch</a>
          </p>
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
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
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
