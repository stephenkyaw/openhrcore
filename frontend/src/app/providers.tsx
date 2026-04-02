import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastProvider } from "@/shared/components/toast"
import { AuthProvider } from "@/shared/auth/auth-context"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
