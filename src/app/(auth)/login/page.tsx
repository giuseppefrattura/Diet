'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { signInWithEmail, signUpWithEmail } from '@/actions/auth';
import { useToast } from '@/components/ui/toast';
import { UtensilsCrossed, Sparkles, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (isSignUp) {
        const res = await signUpWithEmail(formData);
        if (res?.error) {
          toast({ title: 'Errore Registrazione', description: res.error, type: 'error' });
        } else {
          toast({ title: 'Account Creato', description: 'Accesso effettuato con successo!', type: 'success' });
          router.push('/');
        }
      } else {
        const res = await signInWithEmail(formData);
        if (res?.error) {
          toast({ title: 'Errore Accesso', description: res.error, type: 'error' });
        } else {
          toast({ title: 'Bentornato!', description: 'Accesso effettuato con successo.', type: 'success' });
          router.push('/');
        }
      }
    } catch {
      // In demo mode redirect to dashboard
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    toast({
      title: 'Modalità Demo Attivata',
      description: 'Accesso rapido con dati di prova italiani già caricati.',
      type: 'success',
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-[#090d16]">
      <div className="w-full max-w-md space-y-6">
        {/* App Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 mx-auto">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Diet & Smart Fridge
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dispensa FEFO, Piano Alimentare Fisso e Lista della Spesa Intelligente.
          </p>
        </div>

        {/* Demo Fast Track Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg space-y-3">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <p className="text-sm font-bold">Accesso Immediato Senza Registrazione</p>
              <p className="text-xs text-emerald-100">Esplora subito l&apos;app con dati di esempio precaricati.</p>
            </div>
          </div>
          <Button
            onClick={handleDemoAccess}
            variant="secondary"
            className="w-full bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-none"
          >
            Entra Ora in Modalità Demo <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Supabase Login / Signup Card */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{isSignUp ? 'Crea un Account Supabase' : 'Accedi con Supabase'}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </CardTitle>
            <CardDescription className="text-xs">
              Connettiti per sincronizzare i tuoi dati su PostgreSQL con RLS.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="tuamail@esempio.it"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Elaborazione...' : isSignUp ? 'Registrati' : 'Accedi'}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                {isSignUp
                  ? 'Hai già un account? Accedi'
                  : 'Non hai un account? Registrati con Supabase'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
