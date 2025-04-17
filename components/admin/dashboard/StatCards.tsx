import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, FileText, MessagesSquare, Users } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

export function StatCards() {
  // Sample data - in a real app, these would come from your API or database
  const stats = [
    {
      title: 'Total Users',
      value: '3,721',
      description: '↗︎ 2.1% from last month',
      icon: Users,
    },
    {
      title: 'Active Sessions',
      value: '132',
      description: '↘︎ 0.4% from last hour',
      icon: ActivitySquare,
    },
    {
      title: 'Documents',
      value: '89',
      description: '↗︎ 12 added this week',
      icon: FileText,
    },
    {
      title: 'Chat Messages',
      value: '2,491',
      description: '↗︎ 4.3% from yesterday',
      icon: MessagesSquare,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
