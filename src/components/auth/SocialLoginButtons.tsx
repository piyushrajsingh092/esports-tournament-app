import { Button } from '../ui/Button';
import { useStore } from '../../lib/store';

export function SocialLoginButtons() {
    const { loginWithSocial } = useStore();

    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
        try {
            await loginWithSocial(provider);
        } catch (error: any) {
            console.error(`${provider} login error:`, error);
            // You might want to show a toast or alert here
        }
    };

    return (
        <div className="grid grid-cols-3 gap-3">
            <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                <span className="sr-only">Google</span>
            </Button>
            <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="w-full"
            >
                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.048 0-2.732 1.32-2.732 2.91v1.062h3.386l-.651 3.667h-2.735v7.98H9.101Z" />
                </svg>
                <span className="sr-only">Facebook</span>
            </Button>
            <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('twitter')}
                className="w-full"
            >
                <svg className="h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="sr-only">X</span>
            </Button>
        </div>
    );
}
