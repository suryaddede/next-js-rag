import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ActionItemProps {
  title: string;
  description: string;
}

function ActionItem({ title, description }: ActionItemProps) {
  return (
    <div className="bg-muted rounded-md p-3">
      <h3 className="leading-none font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}

export function QuickActions() {
  const actions = [
    {
      title: 'Add Document',
      description: 'Upload a new document to the system',
    },
    {
      title: 'Manage Users',
      description: 'View and edit user permissions',
    },
    {
      title: 'View Logs',
      description: 'Check system logs and events',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => (
          <ActionItem
            key={index}
            title={action.title}
            description={action.description}
          />
        ))}
      </CardContent>
    </Card>
  );
}
