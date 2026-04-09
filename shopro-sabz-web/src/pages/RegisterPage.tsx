import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Mail, Phone, User, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';

const authSchema = z.object({
    fullName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export function RegisterPage() {
    const { register: registerUser, customerLogin } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema),
    });

    const onSubmit = async (data: AuthFormValues) => {
        try {
            // Mock authentication flow
            await registerUser(data);
            
            toast.success(mode === 'LOGIN' ? 'Welcome back!' : 'Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Authentication failed. Please try again.');
        }
    };

    const handleSocialLogin = async (provider: string) => {
        try {
            await customerLogin();
        } catch (error) {
            toast.error(`Failed to initiate ${provider} authentication.`);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
        reset();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5FBFD] dark:bg-[#180B33] p-4 font-sans transition-colors duration-500 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[160px]" />
                <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-accent rounded-full blur-[160px]" />
            </div>

            <Card className="w-full max-w-md border-border/40 shadow-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl glass-panel relative z-10 animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-accent" />
                
                <CardHeader className="space-y-4 pb-6 pt-8">
                    <div className="flex justify-center mb-2">
                        <div className="p-4 bg-primary/10 rounded-full shadow-inner ring-1 ring-primary/20">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <CardTitle className="text-2xl font-bold font-syne tracking-tight">
                            {mode === 'LOGIN' ? 'Welcome Back' : 'Join Sabz'}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {mode === 'LOGIN' ? 'Sign in to manage your dining experience' : 'Premium dining experiences await you'}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="pb-6">
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <Button variant="outline" className="w-full h-11 border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSocialLogin('Google')}>
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </Button>
                        <Button variant="outline" className="w-full h-11 border-border/60 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => handleSocialLogin('Facebook')}>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg>
                        </Button>
                        <Button variant="outline" className="w-full h-11 border-border/60 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSocialLogin('X (Twitter)')}>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </Button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/60" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#F5FBFD]/80 dark:bg-slate-900 px-3 text-muted-foreground font-medium tracking-widest backdrop-blur-sm">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        
                        {mode === 'REGISTER' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Ahmad Shah" className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50" {...register('fullName')} />
                                    </div>
                                    {errors.fullName && <p className="text-[10px] text-error font-medium">{errors.fullName.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Phone/Mobile</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="+93 700..." className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50" {...register('phone')} />
                                    </div>
                                    {errors.phone && <p className="text-[10px] text-error font-medium">{errors.phone.message}</p>}
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label className="text-xs">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="email" placeholder="ahmad@sabz.com" className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50" {...register('email')} />
                            </div>
                            {errors.email && <p className="text-[10px] text-error font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Password</Label>
                                {mode === 'LOGIN' && (
                                    <button type="button" className="text-[10px] text-primary hover:underline" onClick={() => toast.info('Password reset instructions sent.')}>
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50" {...register('password')} />
                            </div>
                            {errors.password && <p className="text-[10px] text-error font-medium">{errors.password.message}</p>}
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full h-12 text-base font-bold font-syne shadow-[0_0_20px_rgba(0,201,167,0.2)] hover:shadow-[0_0_30px_rgba(0,201,167,0.4)] transition-all" disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : (mode === 'LOGIN' ? 'Sign In' : 'Create Account')}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="pt-2 pb-8 flex flex-col justify-center bg-muted/20 border-t border-border/40">
                    <p className="text-sm text-center text-muted-foreground mt-4">
                        {mode === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
                        <button type="button" onClick={toggleMode} className="ml-2 text-primary font-bold hover:underline font-syne">
                            {mode === 'LOGIN' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
