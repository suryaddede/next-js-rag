import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>System activity for the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground flex h-[200px] items-center justify-center">
        Chart placeholder
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        Updated just now
      </CardFooter>
    </Card>
  );
}
