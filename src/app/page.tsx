'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./landing.css";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const features = [
    {
      icon: "🔍",
      title: "Identification IA",
      desc: "Prend une photo, l'IA identifie ta plante en quelques secondes avec plus de 97% de précision. Nom commun, nom latin, famille botanique.",
      tag: "GPT-4o Vision"
    },
    {
      icon: "🩺",
      title: "Diagnostic Santé",
      desc: "Détecte maladies, carences, parasites et problèmes d'arrosage sur tes photos. Score de santé de 0 à 100 avec plan d'action.",
      tag: "Temps réel"
    },
    {
      icon: "📚",
      title: "Fiches Complètes",
      desc: "Arrosage, lumière, terreau, température, toxicité, taille bonsaï… chaque plante a sa fiche expert notée de 1 à 5 étoiles de difficulté.",
      tag: "Expert"
    },
    {
      icon: "🌿",
      title: "Byoombase",
      desc: "Constitue ta collection au fil des identifications. Débloque de nouvelles plantes, compare avec d'autres collectionneurs.",
      tag: "Collection"
    },
    {
      icon: "🔄",
      title: "Compatibilité",
      desc: "Teste si deux plantes peuvent cohabiter dans le même pot. L'IA analyse lumière, eau, pH et parasites communs.",
      tag: "IA"
    },
    {
      icon: "🍳",
      title: "Recettes Botaniques",
      desc: "Pour les plantes comestibles, découvre des recettes adaptées. Herbes, fleurs comestibles, légumes — cuisine avec ce que tu cultives.",
      tag: "Comestibles"
    },
    {
      icon: "🎮",
      title: "Gamification",
      desc: "Gagne des XP à chaque action, débloques des badges d'accomplissement, monte en niveau de Graine à Jardinier Pro.",
      tag: "Points & Badges"
    },
    {
      icon: "🌐",
      title: "Vitrine Publique",
      desc: "Partage ta collection avec le monde. Une page publique pour montrer tes plus belles plantes et ton score de jardinier.",
      tag: "Communauté"
    },
    {
      icon: "🔔",
      title: "Rappels Intelligents",
      desc: "Arrosage, fertilisation, rempotage… Byoom te prévient au bon moment selon la saison et la santé de chaque plante.",
      tag: "PWA"
    }
  ];

  const totalSlides = features.length;
  
  const nextSlide = () => {
    const newSlide = (currentSlide + 1) % totalSlides;
    setCurrentSlide(newSlide);
    // Scroller vers le slide sur mobile
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: newSlide * carouselRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };
  
  const prevSlide = () => {
    const newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    setCurrentSlide(newSlide);
    // Scroller vers le slide sur mobile
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: newSlide * carouselRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  // Mettre à jour le slide actuel lors du scroll (mobile)
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const slideWidth = container.clientWidth;
      const newSlide = Math.round(scrollLeft / slideWidth);
      if (newSlide !== currentSlide && newSlide >= 0 && newSlide < totalSlides) {
        setCurrentSlide(newSlide);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentSlide, totalSlides]);

  // Synchroniser le scroll avec currentSlide quand on clique sur un point
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    
    // Vérifier si on est sur mobile (scroll activé)
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      container.scrollTo({
        left: currentSlide * container.clientWidth,
        behavior: 'smooth'
      });
    }
  }, [currentSlide]);
  
  return (
    <>
      {/* NAV */}
      <nav>
        <div className="logo">by<span>oo</span>m</div>
        <div className="nav-right">
          <ul className="nav-links">
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#pokedex">Pokédex</a></li>
            <li><a href="#pricing">Tarifs</a></li>
            <li><a href="#blog">Blog</a></li>
          </ul>
          <Link href="/login" className="btn-cta">Se connecter</Link>
        </div>
      </nav>

      {/* HERO */}
      <section>
        <div className="hero">
          <div className="hero-content">
            <div className="hero-label">Maintenant en bêta</div>
            <h1>Tes plantes<br/>méritent <em>mieux</em><br/>qu&apos;un oubli</h1>
            <p className="hero-desc">
              Identifie, diagnostique, soigne et collectionne tes plantes grâce à l&apos;intelligence artificielle. Byoom transforme chaque feuille en aventure botanique.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="btn-primary">Commencer gratuitement</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-bg-circle"></div>
            <div className="phone-mock">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="phone-plant-name">Monstera Deliciosa</div>
                <div className="phone-plant-sci">Araceae · Philodendron</div>
                <div className="plant-emoji-big">🌿</div>
                <div className="health-bar-wrap"><div className="health-bar-fill"></div></div>
                <div className="health-label"><span>Santé</span><span>84%</span></div>
                <div className="phone-chips">
                  <div className="chip">💧 3j</div>
                  <div className="chip">☀️ Indirect</div>
                  <div className="chip">🌡️ 18-27°C</div>
                </div>
                <div className="stars-row">
                  <span className="star">⭐</span><span className="star">⭐</span><span className="star">⭐</span><span className="star" style={{opacity:0.3}}>⭐</span><span className="star" style={{opacity:0.3}}>⭐</span>
                </div>
              </div>
            </div>
            <div className="floating-badge badge-xp">
              <div className="xp-dot">⚡</div>
              <div>
                <div style={{fontWeight:700,fontSize:'0.85rem'}}>+50 XP</div>
                <div style={{fontSize:'0.7rem',color:'#888'}}>Nouvelle plante !</div>
              </div>
            </div>
            <div className="floating-badge badge-identified">
              <div className="id-dot">🔍</div>
              <div>
                <div style={{fontWeight:700,fontSize:'0.85rem'}}>Identifiée</div>
                <div style={{fontSize:'0.7rem',color:'#888'}}>Confiance 97%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-num">Vaste catalogue</span>
          <span className="stat-label">de plantes répertorié</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">97%</span>
          <span className="stat-label">Précision d&apos;identification</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">12</span>
          <span className="stat-label">Secondes par diagnostic</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">Free</span>
          <span className="stat-label">Pour commencer</span>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features" id="features">
        <h2 className="section-title-centered">Ce que fait Byoom</h2>
        <div className="features-carousel">
          <button className="carousel-btn carousel-btn-prev" onClick={prevSlide} aria-label="Précédent">
            ‹
          </button>
          <div className="features-carousel-container" ref={carouselRef}>
            <div 
              className="features-carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={index} className="features-slide">
                  <div className="feature-card">
                    <span className="feature-icon">{feature.icon}</span>
                    <div className="feature-title">{feature.title}</div>
                    <p className="feature-desc">{feature.desc}</p>
                    <span className="feature-tag">{feature.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="carousel-btn carousel-btn-next" onClick={nextSlide} aria-label="Suivant">
            ›
          </button>
          <div className="carousel-dots">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Aller à la slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* POKEDEX SECTION */}
      <section className="pokedex-section" id="pokedex">
        <div className="pokedex-inner">
          <div>
            <span className="section-label">Byoombase</span>
            <h2 className="section-title">Encyclopédie botanique premium</h2>
            <p style={{color:'rgba(26,46,23,0.6)',lineHeight:1.7,marginBottom:0,fontSize:'0.95rem'}}>
              Un large catalogue de toutes les plantes enregistrées sur l&apos;application. Découvre leur utilité, leur histoire et certains fun facts !
            </p>
          </div>
          <div className="pokedex-grid">
            <div className="pkd-card new-badge">🌵<div className="pkd-name">Cactus</div></div>
            <div className="pkd-card">🌿<div className="pkd-name">Monstera</div></div>
            <div className="pkd-card">🌺<div className="pkd-name">Hibiscus</div></div>
            <div className="pkd-card">🎋<div className="pkd-name">Bambou</div></div>
            <div className="pkd-card">🌸<div className="pkd-name">Cerisier</div></div>
            <div className="pkd-card locked">❓<div className="pkd-name">???</div></div>
            <div className="pkd-card locked">❓<div className="pkd-name">???</div></div>
            <div className="pkd-card">🍀<div className="pkd-name">Trèfle</div></div>
            <div className="pkd-card locked">❓<div className="pkd-name">???</div></div>
            <div className="pkd-card">🌻<div className="pkd-name">Tournesol</div></div>
            <div className="pkd-card locked">❓<div className="pkd-name">???</div></div>
            <div className="pkd-card locked">❓<div className="pkd-name">???</div></div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-landing" id="pricing" style={{ background: 'var(--parchment)', padding: '2rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-label">Abonnement</span>
            <h2 className="section-title">Débloquez tout Byoom</h2>
            <p style={{color:'rgba(26,46,23,0.6)',lineHeight:1.7,marginBottom:0,fontSize:'0.95rem'}}>
              Identifications illimitées, diagnostics experts, accès complet à la Byoombase et bien plus.
            </p>
          </div>

          {/* TABLEAU COMPARATIF */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: '3rem',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: '1rem',
                    borderBottom: '2px solid rgba(0,0,0,0.1)',
                    borderRight: '1px solid rgba(0,0,0,0.1)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#52414C'
                  }}>Fonctionnalité</th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '1rem',
                    borderBottom: '2px solid rgba(0,0,0,0.1)',
                    borderRight: '1px solid rgba(0,0,0,0.1)',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: '#52414C'
                  }}>
                    🆓
                  </th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: '1rem',
                    borderBottom: '2px solid rgba(0,0,0,0.1)',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: '#52414C'
                  }}>
                    ⭐
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Identifications', freemium: 'Limité', premium: 'Illimité' },
                  { feature: 'Diagnostics', freemium: 'Limité', premium: 'Illimité' },
                  { feature: 'Accès à la Byoombase', freemium: '❌', premium: '✅' },
                  { feature: 'Chat botanique', freemium: 'Limité', premium: 'Illimité' },
                  { feature: 'Historique des diagnostics', freemium: '❌', premium: '✅' },
                  { feature: 'Nouveautés en avant-première', freemium: '❌', premium: '✅' },
                  { feature: 'Guide d\'entretien détaillé', freemium: '❌', premium: '✅' },
                  { feature: 'Assistant personnalisé', freemium: '❌', premium: '✅' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 7 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                    <td style={{ 
                      padding: '1rem',
                      borderRight: '1px solid rgba(0,0,0,0.1)',
                      fontWeight: 500,
                      color: '#52414C',
                      fontSize: '1rem'
                    }}>{row.feature}</td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '1rem',
                      borderRight: '1px solid rgba(0,0,0,0.1)',
                      fontSize: '1rem',
                      color: row.freemium === '❌' ? '#E3655B' : '#596157',
                      fontWeight: 500
                    }}>
                      {row.freemium}
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: '1rem',
                      fontSize: '1rem',
                      color: row.premium === '❌' ? '#E3655B' : '#5B8C5A',
                      fontWeight: 500
                    }}>
                      {row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PLANS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                id: 'monthly',
                name: 'Mensuel',
                price: '4,99€',
                period: '/mois',
                monthlyEquivalent: '4,99€',
                savings: null,
                popular: false,
              },
              {
                id: 'quarterly', 
                name: 'Trimestriel',
                price: '12,99€',
                period: '/3 mois',
                monthlyEquivalent: '4,33€',
                savings: '-13%',
                savingsAmount: '0,66€/mois',
                popular: true,
              },
              {
                id: 'yearly',
                name: 'Annuel',
                price: '35,99€',
                period: '/an',
                monthlyEquivalent: '3,00€',
                savings: '-40%',
                savingsAmount: '1,99€/mois',
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.id}
                style={{
                  backgroundColor: plan.popular ? '#5B8C5A' : 'white',
                  borderRadius: '24px',
                  padding: '2rem',
                  border: plan.popular 
                    ? 'none' 
                    : '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: plan.popular 
                    ? '0 12px 32px rgba(91,140,90,0.3)' 
                    : '0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <p style={{ 
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.3rem',
                      color: plan.popular ? 'white' : '#52414C',
                      margin: 0
                    }}>{plan.name}</p>
                    {plan.savings && (
                      <span style={{
                        backgroundColor: plan.popular 
                          ? 'rgba(255,255,255,0.25)' 
                          : '#FEF3C7',
                        color: plan.popular ? 'white' : '#52414C',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                      }}>{plan.savings}</span>
                    )}
                    {plan.popular && (
                      <span style={{
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                      }}>Populaire</span>
                    )}
                  </div>
                  <div>
                    <p style={{ 
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: plan.popular ? 'white' : '#52414C',
                      margin: 0,
                      lineHeight: '1.2'
                    }}>
                      {plan.price}
                      <span style={{ 
                        fontSize: '1rem', 
                        fontWeight: 400,
                        opacity: 0.8,
                        marginLeft: '0.25rem'
                      }}>{plan.period}</span>
                    </p>
                    {plan.monthlyEquivalent && plan.id !== 'monthly' && (
                      <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: plan.popular ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)'
                      }}>
                        <p style={{
                          fontSize: '0.95rem',
                          color: plan.popular ? 'rgba(255,255,255,0.95)' : '#596157',
                          margin: '0 0 0.5rem 0',
                          fontWeight: 500
                        }}>
                          Soit <strong style={{ color: plan.popular ? 'white' : '#52414C' }}>{plan.monthlyEquivalent}/mois</strong>
                        </p>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}>
                          <div style={{
                            fontSize: '0.9rem',
                            color: plan.popular ? '#FEF3C7' : '#5B8C5A',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>✅</span>
                            <span>vs 4,99€/mois</span>
                          </div>
                          {plan.savingsAmount && (
                            <div style={{
                              fontSize: '0.9rem',
                              color: plan.popular ? '#FEF3C7' : '#5B8C5A',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span>💰</span>
                              <span>Économisez {plan.savingsAmount}</span>
                            </div>
                          )}
                          {plan.savings && (
                            <div style={{
                              fontSize: '0.9rem',
                              color: plan.popular ? '#FEF3C7' : '#5B8C5A',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span>🎯</span>
                              <span>{plan.savings} de réduction</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
          <Link
                  href="/pricing"
                  style={{
                    backgroundColor: plan.popular ? 'white' : '#5B8C5A',
                    color: plan.popular ? '#5B8C5A' : 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '0.875rem 1.75rem',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    display: 'inline-block',
                    boxShadow: plan.popular 
                      ? '0 4px 12px rgba(255,255,255,0.3)' 
                      : '0 4px 12px rgba(91,140,90,0.3)',
                  }}
                >
                  Choisir
          </Link>
              </div>
            ))}
          </div>

          {/* MENTION */}
          <p style={{ 
            textAlign: 'center', 
            color: '#596157', 
            fontSize: '0.75rem',
            marginTop: '1.5rem',
            opacity: 0.7
          }}>
            Paiement sécurisé par Stripe · Résiliation à tout moment
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">byoom</div>
        <div>© 2026 Byoom · byoom.fr · Fait avec 🌿</div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="#" style={{color:'inherit',textDecoration:'none'}}>CGU</a>
          <a href="#" style={{color:'inherit',textDecoration:'none'}}>Confidentialité</a>
          <a href="mailto:contact@byoom.fr" style={{color:'inherit',textDecoration:'none'}}>Contact</a>
      </div>
      </footer>
    </>
  );
}
