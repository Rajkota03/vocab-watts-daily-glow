
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, CreditCard, CalendarCheck, BookOpen, 
  ArrowUpRight, ArrowDownRight, TrendingUp 
} from 'lucide-react';

// Mock data - in a real application, this would come from your API
const stats = [
  { 
    title: 'Total Users', 
    value: '1,283', 
    change: '+12.5%', 
    trend: 'up',
    icon: Users 
  },
  { 
    title: 'Pro Subscribers', 
    value: '423', 
    change: '+18.2%', 
    trend: 'up',
    icon: CreditCard 
  },
  { 
    title: 'Active Today', 
    value: '652', 
    change: '+5.1%', 
    trend: 'up',
    icon: CalendarCheck 
  },
  { 
    title: 'Total Words', 
    value: '8,764', 
    change: '+3.2%', 
    trend: 'up',
    icon: BookOpen 
  },
];

const OverviewTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Key metrics and statistics for the vocabulary platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-sm">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-muted-foreground text-sm">Chart placeholder - User growth over time</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-muted-foreground text-sm">Chart placeholder - Pro vs Free users</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
