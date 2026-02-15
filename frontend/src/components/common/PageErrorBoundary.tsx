import { Component, ReactNode } from 'react';
import { AlertTriangle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Page Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto" weight="duotone" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Oops! Terjadi Kesalahan</h2>
              <p className="text-muted-foreground">
                {this.props.fallbackMessage || 'Maaf, terjadi kesalahan saat memuat halaman ini.'}
              </p>
            </div>
            {this.state.error && import.meta.env.DEV && (
              <div className="p-4 bg-muted rounded-lg text-left">
                <p className="text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                variant="outline"
              >
                Coba Lagi
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Kembali ke Beranda
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
