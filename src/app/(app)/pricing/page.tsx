'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { isPremium } from '@/lib/subscription';

export default function PricingPage() {
  const { user, pb } = usePocketBase();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'monthly',
      name: 'Mensuel',
      price: '4,99€',
      period: '/mois',
      monthlyEquivalent: '4,99€',
      savings: null,
      popular: false,
      color: '#596157',
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
      color: '#5B8C5A',
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
      color: '#52414C',
    },
  ];

  const premiumFeatures = [
    { icon: '🔍', text: 'Identifications illimitées' },
    { icon: '🔬', text: 'Diagnostics illimités' },
    { icon: '📖', text: 'Accès complet à la Byoombase' },
    { icon: '🌿', text: 'Chat botanique illimité' },
    { icon: '📊', text: 'Historique complet des diagnostics' },
    { icon: '🚀', text: 'Accès aux nouveautés en avant-première' },
    { icon: '🎯', text: 'Guide d\'entretien ultra-détaillé' },
    { icon: '🤖', text: 'Assistant personnalisé avec contexte jardin' },
  ];

  const freemiumLimits = [
    { icon: '🔍', text: '2 identifications max' },
    { icon: '🔬', text: '1 diagnostic/mois par plante' },
    { icon: '💬', text: 'Chat limité (5 messages/jour)' },
    { icon: '❌', text: 'Byoombase non accessible' },
    { icon: '❌', text: 'Nouveautés non accessibles' },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) { router.push('/login'); return; }
    
    setLoading(planId);
    try {
      const authData = pb.authStore.model;
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId: authData?.id,
          userEmail: authData?.email,
        }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
    } finally {
      setLoading(null);
    }
  };

  const userIsPremium = isPremium(user);

  return (
    <div style={{ 
      backgroundColor: '#F5F0E8', 
      minHeight: '100vh',
      paddingBottom: '80px',
      width: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', boxSizing: 'border-box' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(254, 243, 199, 0.4)',
          }}>
            <span style={{ fontSize: '2rem' }}>⭐</span>
          </div>
          <p style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            letterSpacing: '0.15em',
            color: '#5B8C5A',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>Abonnement</p>
          <h1 style={{ 
            fontFamily: 'Georgia, serif',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#52414C',
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            Débloquez tout Byoom 🌿
          </h1>
          <p style={{ 
            color: '#596157', 
            fontSize: '1.1rem', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Identifications illimitées, diagnostics experts, 
            accès complet à la Byoombase et bien plus.
          </p>
        </div>

        {/* COMPARAISON FREEMIUM VS PREMIUM */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Freemium */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
              paddingBottom: '1.25rem',
              borderBottom: '2px solid rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontSize: '1.75rem' }}>🆓</span>
              <p style={{ 
                fontWeight: 700, 
                color: '#52414C',
                fontSize: '1.25rem',
                margin: 0
              }}>Gratuit</p>
            </div>
            <div style={{ flex: 1 }}>
              {freemiumLimits.map((item, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
                  <span style={{ 
                    fontSize: '1.05rem', 
                    color: item.icon === '❌' ? '#E3655B' : '#596157',
                    lineHeight: '1.6',
                    fontWeight: item.icon === '❌' ? 500 : 400
                  }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium */}
          <div style={{
            backgroundColor: '#5B8C5A',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(91,140,90,0.25)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            minWidth: 0,
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.15)',
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
              paddingBottom: '1.25rem',
              borderBottom: '2px solid rgba(255,255,255,0.25)'
            }}>
              <span style={{ fontSize: '1.75rem' }}>⭐</span>
              <p style={{ 
                fontWeight: 700, 
                color: 'white',
                fontSize: '1.25rem',
                margin: 0
              }}>Premium</p>
            </div>
            <div style={{ flex: 1 }}>
              {premiumFeatures.map((item, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
                  <span style={{ 
                    fontSize: '1.05rem', 
                    color: 'rgba(255,255,255,0.95)',
                    lineHeight: '1.6',
                    fontWeight: 400
                  }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SI DÉJÀ PREMIUM */}
        {userIsPremium ? (
          <div style={{
            backgroundColor: '#5B8C5A',
            borderRadius: '20px',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700 }}>
              Tu es déjà Premium !
            </p>
            <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Profite de toutes les fonctionnalités sans limite 🌿
            </p>
          </div>
        ) : (
          /* PLANS */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {plans.map((plan) => (
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
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!plan.popular) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.popular) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  }
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
                      fontFamily: 'Georgia, serif',
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
                      fontFamily: 'Georgia, serif',
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
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  style={{
                    backgroundColor: plan.popular ? 'white' : '#5B8C5A',
                    color: plan.popular ? '#5B8C5A' : 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '0.875rem 1.75rem',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: loading === plan.id ? 'not-allowed' : 'pointer',
                    opacity: loading === plan.id ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: plan.popular 
                      ? '0 4px 12px rgba(255,255,255,0.3)' 
                      : '0 4px 12px rgba(91,140,90,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    if (loading !== plan.id) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {loading === plan.id ? '...' : 'Choisir'}
                </button>
              </div>
            ))}
          </div>
        )}

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
    </div>
  );
}
