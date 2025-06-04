import { WelcomeCard } from '@/components/admin/WelcomeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDocuments } from '@/lib/chroma-db';

// Make this a server component to fetch documents server-side
export default async function AdminPage() {
  // Fetch document count from ChromaDB
  let documentCount = 0;
  try {
    const documents = await getDocuments();
    documentCount = documents.ids.length;
  } catch (error) {
    console.error('Error fetching document count:', error);
  }

  return (
    <div className="space-y-6">
      <WelcomeCard />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="text-muted-foreground h-4 w-4"
            >
              <path d="M15 17h5l-1.4-1.4a6 6 0 0 0 0-8.4A6 6 0 0 0 8.6 4.6L7.1 6h5" />
              <path d="M9 6.6A6 6 0 0 1 15 17h2.8a8 8 0 0 0 .2-11.5" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCount}</div>
            <p className="text-muted-foreground text-xs">
              Documents in knowledge base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="text-muted-foreground h-4 w-4"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-muted-foreground text-xs">
              ChromaDB and embedding service
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="text-muted-foreground h-4 w-4"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <a
                href="/admin/document"
                className="text-blue-600 hover:underline"
              >
                Manage Documents
              </a>
              <a
                href="/admin/dashboard"
                className="text-blue-600 hover:underline"
              >
                View Dashboard
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
