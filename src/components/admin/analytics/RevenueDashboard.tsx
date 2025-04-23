
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { CircleDollarSign, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import * as Recharts from "recharts";

// Dummy data for stat cards (simulate period-over-period changes)
const metricStats = [
  {
    title: "Total Revenue",
    value: "₹142,000",
    icon: CircleDollarSign,
    color: "#2DCDA5",
    change: "+9.6%",
    trendUp: true,
    desc: "Since launch"
  },
  {
    title: "MRR",
    value: "₹15,200",
    icon: DollarSign,
    color: "#3F3D56",
    change: "+2.1%",
    trendUp: true,
    desc: "Monthly Recurring Revenue"
  },
  {
    title: "Trial Conversion Rate",
    value: "38.5%",
    icon: TrendingUp,
    color: "#FF6B6B",
    change: "+1.3%",
    trendUp: true,
    desc: "vs. last month"
  },
  {
    title: "ARPU",
    value: "₹420",
    icon: DollarSign,
    color: "#3F3D56",
    change: "-0.9%",
    trendUp: false,
    desc: "Average revenue/user"
  }
];

type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";

function generateRevenueData(timeframe: TimeFrame) {
  let data: { date: string; revenue: number }[] = [];
  const now = new Date();
  const minMax = {
    daily: [800, 2000],
    weekly: [7000, 14000],
    monthly: [25000, 35000],
    yearly: [120000, 170000]
  };
  function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  switch (timeframe) {
    case "daily":
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: randomBetween(minMax.daily[0], minMax.daily[1])
        });
      }
      break;
    case "weekly":
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        data.push({
          date: `Week ${8 - i}`,
          revenue: randomBetween(minMax.weekly[0], minMax.weekly[1])
        });
      }
      break;
    case "monthly":
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString("en-US", { month: "short" }),
          revenue: randomBetween(minMax.monthly[0], minMax.monthly[1])
        });
      }
      break;
    case "yearly":
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        data.push({
          date: date.getFullYear().toString(),
          revenue: randomBetween(minMax.yearly[0], minMax.yearly[1])
        });
      }
      break;
  }
  return data;
}

const RevenueDashboard = () => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("monthly");
  const data = generateRevenueData(timeframe);
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#3F3D56"
    }
  };

  return (
    <section className="my-12">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-vuilder-indigo">Revenue Dashboard</h2>
        <p className="text-gray-600 mt-2 mb-4">Monitor Glintup's subscription revenue and trends</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-8">
        {metricStats.map((m) => (
          <Card
            key={m.title}
            className="flex flex-col justify-between bg-white border shadow-sm rounded-xl dark:bg-[#232323]"
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <div
                className="rounded-full p-2"
                style={{ background: m.color + "15" }}
              >
                <m.icon color={m.color} size={22} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-vuilder-indigo">
                  {m.title}
                </CardTitle>
                <CardDescription className="text-xs">{m.desc}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">{m.value}</span>
                <span className={`text-xs ${m.trendUp ? "text-green-600" : "text-rose-600"} font-semibold flex items-center`}>
                  {m.trendUp ? <TrendingUp className="inline mr-0.5 h-3 w-3" /> : <TrendingDown className="inline mr-0.5 h-3 w-3" />}
                  {m.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Over Time chart */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-vuilder-indigo">Revenue Over Time</CardTitle>
            <CardDescription>Explore how revenue trends change across time scales</CardDescription>
          </div>
          {/* Toggle Tabs */}
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeFrame)} className="mt-2 w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[340px] w-full overflow-x-auto">
            <ChartContainer config={chartConfig} className="h-full">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.LineChart
                  data={data}
                  margin={{ top: 24, right: 30, left: 20, bottom: 30 }}
                >
                  <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <Recharts.XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280" }}
                    tickLine={{ stroke: "#e5e7eb" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Recharts.YAxis
                    tick={{ fill: "#6b7280" }}
                    tickLine={{ stroke: "#e5e7eb" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    width={56}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Recharts.Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#3F3D56"
                    strokeWidth={2}
                    dot={{ stroke: "#3F3D56", strokeWidth: 2, r: 4, fill: "white" }}
                    activeDot={{
                      r: 6,
                      stroke: "#3F3D56",
                      strokeWidth: 2,
                      fill: "#2DCDA5"
                    }}
                    animationDuration={500}
                  />
                </Recharts.LineChart>
              </Recharts.ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-vuilder-mint" />
            <span>
              Data: {timeframe === "daily"
                ? "Last 14 days"
                : timeframe === "weekly"
                ? "Last 8 weeks"
                : timeframe === "monthly"
                ? "Last 12 months"
                : "Last 5 years"}
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RevenueDashboard;
