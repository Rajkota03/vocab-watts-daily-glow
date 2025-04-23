
import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBar, Calendar } from 'lucide-react';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ChartType = 'line' | 'bar';

// Generate dummy data for demonstration
const generateDummyData = (timeframe: TimeFrame) => {
  let data: { date: string; users: number }[] = [];
  const now = new Date();
  const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
  
  switch (timeframe) {
    case 'daily':
      // Generate data for last 14 days
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: randomBetween(10, 50)
        });
      }
      break;
      
    case 'weekly':
      // Generate data for last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        data.push({
          date: `Week ${8-i}`,
          users: randomBetween(50, 120)
        });
      }
      break;
      
    case 'monthly':
      // Generate data for last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          users: randomBetween(100, 300)
        });
      }
      break;
      
    case 'yearly':
      // Generate data for last 5 years
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        data.push({
          date: date.getFullYear().toString(),
          users: randomBetween(500, 1500)
        });
      }
      break;
  }
  
  return data;
};

const UserGrowthReport = () => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('monthly');
  const [chartType, setChartType] = useState<ChartType>('line');
  const data = generateDummyData(timeframe);
  
  const chartConfig = {
    users: {
      label: 'New Users',
      color: '#2DCDA5' // Mint color
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-vuilder-indigo">User Growth Report</CardTitle>
            <CardDescription className="mt-1">
              Visualizing the growth of new users over time
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeFrame)} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value as ChartType)}>
              <ToggleGroupItem value="line">
                <ChartBar className="h-4 w-4" />
                <span className="sr-only">Line Chart</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="bar">
                <ChartBar className="h-4 w-4" />
                <span className="sr-only">Bar Chart</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="h-[400px] w-full overflow-x-auto">
          <ChartContainer config={chartConfig} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="users"
                    stroke="#2DCDA5" 
                    strokeWidth={2}
                    dot={{ stroke: '#2DCDA5', strokeWidth: 2, r: 4, fill: 'white' }}
                    activeDot={{ r: 6, stroke: '#2DCDA5', strokeWidth: 2, fill: '#2DCDA5' }}
                    animationDuration={500}
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="users"
                    name="users"
                    fill="#2DCDA5"
                    radius={[4, 4, 0, 0]}
                    animationDuration={500}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-4 text-sm text-gray-500 flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>
            Data shown: {timeframe === 'daily' ? 'Last 14 days' : 
                         timeframe === 'weekly' ? 'Last 8 weeks' :
                         timeframe === 'monthly' ? 'Last 12 months' : 
                         'Last 5 years'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserGrowthReport;
