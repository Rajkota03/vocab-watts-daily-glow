
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ConversionChartData {
  date: string;
  conversion: number;
}

interface ConversionRateChartProps {
  data: ConversionChartData[];
}

export function ConversionRateChart({ data }: ConversionRateChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Rate Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line 
                type="monotone" 
                dataKey="conversion" 
                stroke="#2DCDA5" 
                strokeWidth={2}
                dot={{ fill: '#2DCDA5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
