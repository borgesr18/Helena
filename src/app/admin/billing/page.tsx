'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CreditCard, Check, Crown } from 'lucide-react';
import { stripeService, SubscriptionPlan } from '@/lib/stripeService';

interface SubscriptionStatus {
  currentPlan: string;
  status: string;
  nextBilling: Date | null;
  customerId: string | null;
}

export default function BillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const availablePlans = stripeService.getPlans();
      setPlans(availablePlans);
      
      setCurrentSubscription({
        currentPlan: 'helena_free',
        status: 'ativo',
        nextBilling: null,
        customerId: null
      });
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === 'helena_free') return;
    
    setUpgrading(planId);
    try {
      const session = await stripeService.createCheckoutSession(
        planId,
        'clinic-id',
        'user-id',
        `${window.location.origin}/admin/billing?success=true`,
        `${window.location.origin}/admin/billing?canceled=true`
      );
      
      await stripeService.redirectToCheckout(session.sessionId);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    if (!currentSubscription?.customerId) return;
    
    try {
      const session = await stripeService.createBillingPortalSession(
        currentSubscription.customerId,
        `${window.location.origin}/admin/billing`
      );
      
      window.location.href = session.url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Erro ao abrir portal de cobrança.');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helena-blue"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Planos e Cobrança</h1>
            <p className="text-helena-gray mt-2">Gerencie sua assinatura e faturamento</p>
          </div>
          {currentSubscription?.customerId && (
            <button
              onClick={handleManageBilling}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <CreditCard size={20} />
              <span>Gerenciar Cobrança</span>
            </button>
          )}
        </div>

        {currentSubscription && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Plano Atual</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-helena-gray">Plano ativo:</p>
                <p className="text-xl font-bold text-helena-blue">
                  {plans.find(p => p.id === currentSubscription.currentPlan)?.name || 'Gratuito'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-helena-gray">Status:</p>
                <p className="text-lg font-medium text-green-600">{currentSubscription.status}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentSubscription?.currentPlan === plan.id;
            const isPopular = plan.id === 'helena_premium';
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-sm border p-6 ${
                  isPopular ? 'border-helena-blue ring-2 ring-helena-blue ring-opacity-20' : 'border-gray-100'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-helena-blue text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Crown size={12} />
                      <span>Mais Popular</span>
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-800">
                      {stripeService.formatPrice(plan.price)}
                    </span>
                    <span className="text-helena-gray">/{plan.interval === 'month' ? 'mês' : 'ano'}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || upgrading === plan.id || plan.price === 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.price === 0
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-helena-blue text-white hover:bg-blue-600'
                  }`}
                >
                  {upgrading === plan.id ? (
                    'Processando...'
                  ) : isCurrent ? (
                    'Plano Atual'
                  ) : plan.price === 0 ? (
                    'Gratuito'
                  ) : (
                    'Assinar'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
