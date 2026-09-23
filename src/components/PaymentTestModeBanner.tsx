const clientToken = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'] as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
        Betalen is nog niet live geactiveerd.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full rounded-lg border border-accent bg-accent/30 px-4 py-2 text-center text-sm text-foreground">
        Betalingen in de preview zijn testbetalingen (testkaart 4242 4242 4242 4242).{" "}
        <a
          href="https://docs.lovable.dev/features/payments#test-and-live-environments"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline"
        >
          Meer info
        </a>
      </div>
    );
  }
  return null;
}
