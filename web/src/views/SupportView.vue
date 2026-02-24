<template>
  <div class="support-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('support.title') }}</h1>
        <p class="hero-subtitle">{{ $t('support.subtitle') }}</p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-section">
      <div class="section-container">

        <!-- App Description -->
        <div class="content-card">
          <h2 class="section-title">{{ $t('support.aboutTitle') }}</h2>
          <p class="section-text">{{ $t('support.aboutText') }}</p>
        </div>

        <!-- FAQ -->
        <div class="content-card">
          <h2 class="section-title">{{ $t('support.faqTitle') }}</h2>
          <div class="faq-list">
            <div
              v-for="(faq, index) in faqs"
              :key="index"
              class="faq-item"
              :class="{ 'faq-open': openFaq === index }"
            >
              <button class="faq-question" @click="toggleFaq(index)">
                <span>{{ faq.question }}</span>
                <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div class="faq-answer" v-show="openFaq === index">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="content-card">
          <h2 class="section-title">{{ $t('support.contactTitle') }}</h2>
          <p class="section-text">{{ $t('support.contactText') }}</p>
          <a href="mailto:info@slopesafe.ch" class="contact-link">
            <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            info@slopesafe.ch
          </a>
        </div>

        <!-- Legal Links -->
        <div class="content-card">
          <h2 class="section-title">{{ $t('support.legalTitle') }}</h2>
          <div class="legal-links">
            <router-link :to="{ name: 'privacy' }" class="legal-link-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {{ $t('support.privacyPolicy') }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="chevron-right">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </router-link>
            <router-link :to="{ name: 'imprint' }" class="legal-link-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              {{ $t('support.imprint') }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="chevron-right">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </router-link>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const openFaq = ref(null);

const faqs = computed(() => [
  { question: t('support.faq1Question'), answer: t('support.faq1Answer') },
  { question: t('support.faq2Question'), answer: t('support.faq2Answer') },
  { question: t('support.faq3Question'), answer: t('support.faq3Answer') },
  { question: t('support.faq4Question'), answer: t('support.faq4Answer') },
  { question: t('support.faq5Question'), answer: t('support.faq5Answer') },
  { question: t('support.faq6Question'), answer: t('support.faq6Answer') }
]);

const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index;
};
</script>

<style scoped>
.support-view {
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

/* FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.faq-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-base);
}

.faq-item.faq-open {
  border-color: var(--brand-sky-blue);
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-primary);
  text-align: left;
  gap: var(--spacing-md);
  font-family: inherit;
}

.faq-question:hover {
  background-color: var(--color-background-secondary);
}

.faq-chevron {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  transition: transform var(--transition-base);
}

.faq-open .faq-chevron {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 var(--spacing-lg) var(--spacing-md);
}

.faq-answer p {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* Contact */
.contact-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-xl);
  background-color: rgba(26, 54, 93, 0.08);
  border-radius: 10px;
  color: #1a365d;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.contact-link:hover {
  background-color: rgba(26, 54, 93, 0.14);
}

.contact-icon {
  width: 20px;
  height: 20px;
}

/* Legal Links */
.legal-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.legal-link-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.legal-link-item:hover {
  background-color: var(--color-background-secondary);
  border-color: var(--brand-sky-blue);
}

.legal-link-item .chevron-right {
  margin-left: auto;
  color: var(--color-text-tertiary);
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
}

@media (max-width: 360px) {
  .hero-section {
    padding: var(--spacing-lg) var(--spacing-sm);
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

  .faq-question {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.9375rem;
  }

  .faq-answer {
    padding: 0 var(--spacing-md) var(--spacing-sm);
  }
}
</style>
