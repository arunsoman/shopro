import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupplierAuth } from '../SupplierAuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const SupplierLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useSupplierAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome to the Supplier Portal');
            navigate('/supplier/dashboard');
        } catch (error) {
            toast.error('Invalid credentials or inactive account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <Card className="w-full  border-none shadow-2xl overflow-hidden">
                <div className="h-2 bg-indigo-600" />
                <CardHeader className="space-y-1 text-center pt-8">
                    <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Supplier portal</CardTitle>
                    <CardDescription>
                        Bidding & inventory coordination for Shopro partners
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Business Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="pl-10 h-12"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold text-lg gap-2"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In to Portal'}
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t text-center">
                        <p className="text-xs text-slate-500">
                            Don't have an account? Reach out to your local Shopro contact to request an invitation.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
