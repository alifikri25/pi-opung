export default function ProdukLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-muted rounded animate-skeleton mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-background rounded-2xl overflow-hidden border border-border">
            <div className="aspect-square bg-muted animate-skeleton" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded animate-skeleton" />
              <div className="h-4 w-16 bg-muted rounded animate-skeleton" />
              <div className="h-10 bg-muted rounded-lg animate-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
