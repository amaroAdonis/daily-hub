import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
  // Feedback de erro para toda mutação, sem precisar tratar caso a caso.
  // (Sucessos relevantes disparam toasts pontuais nos hooks de cada feature.)
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Algo deu errado.');
    },
  }),
});
