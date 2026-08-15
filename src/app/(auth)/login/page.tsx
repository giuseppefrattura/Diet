'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { signInWithEmail, signUpWithEmail } from '@/actions/auth';
import { useToast } from '@/components/ui/toast';
import { UtensilsCrossed, ShieldCheck, Lock, Mail, UserPlus, LogIn } from 'lucide-react';

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
        } else if (res?.needsConfirmation) {
          toast({
            title: 'Controlla la tua Email',
            description: 'Ti abbiamo inviato un link di conferma per attivare il tuo account.',
            type: 'info',
            duration: 8000,
          });
        } else {
          toast({ title: 'Benvenuto!', description: 'Account creato e accesso effettuato.', type: 'success' });
          router.push('/');
          router.refresh();
        }
      } else {
        const res = await signInWithEmail(formData);
        if (res?.error) {
          toast({ title: 'Credenziali non valide', description: res.error, type: 'error' });
        } else {
          toast({ title: 'Bentornato!', description: 'Accesso effettuato con successo.', type: 'success' });
          router.push('/');
          router.refresh();
        }
      }
    } catch (err: any) {
      toast({
        title: 'Errore',
        description: err?.message || 'Si è verificato un errore durante l\'operazione.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-[#090d16]">
      <div className="w-full max-w-md space-y-6">
        {/* App Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 mx-auto">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Diet & Smart Fridge
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Accedi con le tue credenziali per sincronizzare la tua dispensa e il piano pasti.
          </p>
        </div>

        {/* Authentication Card */}
        <Card className="p-6 shadow-xl border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-0 pb-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {isSignUp ? (
                  <>
                    <UserPlus className="w-5 h-5 text-emerald-600" /> Crea Nuovo Account
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 text-emerald-600" /> Accedi all&apos;App
                  </>
                )}
              </CardTitle>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <CardDescription className="text-xs mt-1">
              {isSignUp
                ? 'Inserisci email e password per creare il tuo profilo protetto.'
                : 'Inserisci le tue credenziali per visualizzare e gestire i tuoi dati.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="nome@esempio.it"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                {isSignUp && (
                  <p className="text-[11px] text-slate-400 mt-1">Minimo 6 caratteri.</p>
                )}
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full font-bold shadow-md shadow-emerald-600/20 mt-2"
                disabled={loading}
              >
                {loading
                  ? 'Verifica in corso...'
                  : isSignUp
                  ? 'Registrati'
                  : 'Accedi'}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                {isSignUp
                  ? 'Hai già un account? Clicca qui per accedere'
                  : 'Non hai ancora un account? Registrati ora'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
