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
      savings: null,
      popular: false,
      color: '#596157',
    },
    {
      id: 'quarterly', 
      name: 'Trimestriel',
      price: '12,99€',
      period: '/3 mois',
      savings: '-13%',
      popular: true,
      color: '#5B8C5A',
    },
    {
      id: 'yearly',
      name: 'Annuel',
      price: '35,99€',
      period: '/an',
      savings: '-40%',
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
      paddingBottom: '80px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
            fontSize: '2rem',
            fontWeight: 700,
            color: '#52414C',
            marginBottom: '0.75rem'
          }}>
            Débloquez tout Byoom 🌿
          </h1>
          <p style={{ color: '#596157', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            Identifications illimitées, diagnostics experts, 
            accès complet à la Byoombase et bien plus.
          </p>
        </div>

        {/* COMPARAISON FREEMIUM VS PREMIUM */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Freemium */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '1.25rem',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <p style={{ 
              fontWeight: 700, 
              color: '#596157',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>🆓 Gratuit</p>
            {freemiumLimits.map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                gap: '0.5rem',
                marginBottom: '0.6rem',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '0.85rem' }}>{item.icon}</span>
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: item.icon === '❌' ? '#E3655B' : '#596157'
                }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Premium */}
          <div style={{
            backgroundColor: '#5B8C5A',
            borderRadius: '20px',
            padding: '1.25rem',
          }}>
            <p style={{ 
              fontWeight: 700, 
              color: 'white',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>⭐ Premium</p>
            {premiumFeatures.map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                gap: '0.5rem',
                marginBottom: '0.6rem',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '0.85rem' }}>{item.icon}</span>
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: 'rgba(255,255,255,0.95)'
                }}>{item.text}</span>
              </div>
            ))}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  backgroundColor: plan.popular ? '#5B8C5A' : 'white',
                  borderRadius: '20px',
                  padding: '1.25rem 1.5rem',
                  border: plan.popular 
                    ? 'none' 
                    : '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: plan.popular 
                    ? '0 8px 24px rgba(91,140,90,0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ 
                      fontFamily: 'Georgia, serif',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: plan.popular ? 'white' : '#52414C'
                    }}>{plan.name}</p>
                    {plan.savings && (
                      <span style={{
                        backgroundColor: plan.popular 
                          ? 'rgba(255,255,255,0.2)' 
                          : '#CFD186',
                        color: plan.popular ? 'white' : '#52414C',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '20px',
                      }}>{plan.savings}</span>
                    )}
                    {plan.popular && (
                      <span style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '20px',
                      }}>Populaire</span>
                    )}
                  </div>
                  <p style={{ 
                    fontFamily: 'Georgia, serif',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: plan.popular ? 'white' : '#52414C',
                    marginTop: '0.25rem'
                  }}>
                    {plan.price}
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 400,
                      opacity: 0.8
                    }}>{plan.period}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  style={{
                    backgroundColor: plan.popular ? 'white' : '#5B8C5A',
                    color: plan.popular ? '#5B8C5A' : 'white',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '0.75rem 1.25rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    opacity: loading === plan.id ? 0.7 : 1,
                    whiteSpace: 'nowrap',
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
