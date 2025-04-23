import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DollarSign, TrendingUp, TrendingDown, CircleDollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import * as Recharts from "recharts";

type Subscription = {
  id: string;
  user_id: string;
  amount?: number;
  is_pro: boolean;
  category?: string;
  created_at: string;
};

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_pro: boolean;
  category: string;
  created_at: string;
};

type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";

function groupSubsByTimeframe(subs: Subscription[], timeframe: TimeFrame) {
  const now = new Date();
  let grouped: { date: string; revenue: number }[] = [];
  switch (timeframe) {
    case "daily": {
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const total = subs
          .filter((s) => {
            const subDate = new Date(s.created_at);
            return (
              subDate.getFullYear() === date.getFullYear() &&
              subDate.getMonth() === date.getMonth() &&
              subDate.getDate() === date.getDate()
            );
          })
          .reduce((acc, s) => acc + (s.amount || 300), 0);
        grouped.push({ date: label, revenue: total });
      }
      break;
    }
    case "weekly": {
      for (let i = 7; i >= 0; i--) {
        const current = new Date(now);
        current.setDate(current.getDate() - i * 7);
        const weekStart = new Date(current);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const subsThisWeek = subs.filter((s) => {
          const subDate = new Date(s.created_at);
          return subDate >= weekStart && subDate <= weekEnd;
        });
        const label = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        const total = subsThisWeek.reduce((acc, s) => acc + (s.amount || 300), 0);
        grouped.push({ date: label, revenue: total });
      }
      break;
    }
    case "monthly": {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();
        const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        const total = subs
          .filter((s) => {
            const subDate = new Date(s.created_at);
            return subDate.getFullYear() === year && subDate.getMonth() === month;
          })
          .reduce((acc, s) => acc + (s.amount || 300), 0);
        grouped.push({ date: label, revenue: total });
      }
      break;
    }
    case "yearly": {
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        const year = date.getFullYear();
        const total = subs
          .filter((s) => {
            const subDate = new Date(s.created_at);
            return subDate.getFullYear() === year;
          })
          .reduce((acc, s) => acc + (s.amount || 300), 0);
        grouped.push({ date: `${year}`, revenue: total });
      }
      break;
    }
  }
  return grouped;
}

const RevenueDashboard = () => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("monthly");
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState<string>('');
  const [testNumber, setTestNumber] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data: subData, error } = await supabase
          .from("user_subscriptions")
          .select("id, user_id, is_pro, category, created_at");
        if (error) throw error;
        setSubs(subData ?? []);
      } catch (err) {
        toast({
          title: "Error loading subscriptions",
          description: err.message || String(err),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalRevenue = subs.filter((s) => s.is_pro).length * 300;
  const monthlyMRR =
    subs.filter((s) => {
      const date = new Date(s.created_at);
      const now = new Date();
      return (
        s.is_pro &&
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length * 300;

  const trialConversionRate = "N/A";
  const ARPU = subs.length ? `₹${(totalRevenue / subs.length).toFixed(0)}` : "₹0";

  const metricStats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue}`,
      icon: CircleDollarSign,
      color: "#2DCDA5",
      change: "",
      trendUp: true,
      desc: "Since launch",
    },
    {
      title: "MRR",
      value: `₹${monthlyMRR}`,
      icon: DollarSign,
      color: "#3F3D56",
      change: "",
      trendUp: true,
      desc: "Monthly Recurring Revenue",
    },
    {
      title: "Trial Conversion Rate",
      value: trialConversionRate,
      icon: TrendingUp,
      color: "#FF6B6B",
      change: "",
      trendUp: true,
      desc: "vs. last month",
    },
    {
      title: "ARPU",
      value: ARPU,
      icon: DollarSign,
      color: "#3F3D56",
      change: "",
      trendUp: true,
      desc: "Average revenue/user",
    },
  ];

  const chartData = groupSubsByTimeframe(subs.filter(s => s.is_pro), timeframe);

  const sendTestEmail = async () => {
    if (!testEmail) return toast({ title: "Provide an email!" });
    setSendingEmail(true);
    try {
      const result = await supabase.functions.invoke("send-vocab-email", {
        body: {
          email: testEmail,
          category: "business-intermediate",
          wordCount: 5,
          force_new_words: true,
        },
      });
      if (result.error) {
        toast({
          title: "Failed to send test email",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Email sent!", description: "Test email sent successfully." });
      }
    } catch (err: any) {
      toast({
        title: "Error sending email",
        description: err.message || String(err),
        variant: "destructive",
      });
    }
    setSendingEmail(false);
  };

  const sendTestWhatsApp = async () => {
    if (!testNumber) return toast({ title: "Provide a WhatsApp number!" });
    setSendingWhatsApp(true);
    try {
      const result = await supabase.functions.invoke("send-whatsapp", {
        body: {
          to: testNumber,
          category: "business-intermediate",
          isPro: true,
        },
      });
      if (result.error) {
        toast({
          title: "Failed to send WhatsApp",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "WhatsApp sent!", description: "Test WhatsApp sent successfully." });
      }
    } catch (err: any) {
      toast({
        title: "Error sending WhatsApp",
        description: err.message || String(err),
        variant: "destructive",
      });
    }
    setSendingWhatsApp(false);
  };

  const sendEmailToAll = async () => {
    setSendingEmail(true);
    try {
      const userEmailsRes = await supabase
        .from("profiles")
        .select("email");
      const emails = userEmailsRes.data?.map(u => u.email).filter(Boolean) ?? [];
      for (const email of emails) {
        const result = await supabase.functions.invoke("send-vocab-email", {
          body: {
            email,
            category: "business-intermediate",
            wordCount: 5,
            force_new_words: true,
          },
        });
        if (result.error) {
          toast({
            title: `Error sending email to ${email}`,
            description: result.error.message,
            variant: "destructive",
          });
        }
      }
      toast({ title: "Emails sent to all!", description: "Test emails sent all users." });
    } catch (err: any) {
      toast({
        title: "Error sending to all",
        description: err.message || String(err),
        variant: "destructive",
      });
    }
    setSendingEmail(false);
  };

  const sendWhatsAppToAll = async () => {
    setSendingWhatsApp(true);
    try {
      const { data: userSubs } = await supabase
        .from("user_subscriptions")
        .select("phone_number, is_pro, category, user_id");
      for (const sub of userSubs ?? []) {
        if (!sub.phone_number) continue;
        const result = await supabase.functions.invoke("send-whatsapp", {
          body: {
            to: sub.phone_number,
            category: sub.category || "business-intermediate",
            isPro: sub.is_pro,
            userId: sub.user_id
          },
        });
        if (result.error) {
          toast({
            title: `Error sending WhatsApp to ${sub.phone_number}`,
            description: result.error.message,
            variant: "destructive",
          });
        }
      }
      toast({ title: "WhatsApp sent to all!", description: "Test WhatsApp sent all users." });
    } catch (err: any) {
      toast({
        title: "Error sending WhatsApp to all",
        description: err.message || String(err),
        variant: "destructive",
      });
    }
    setSendingWhatsApp(false);
  };

  return (
    <section className="my-12">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-vuilder-indigo">Revenue Dashboard</h2>
        <p className="text-gray-600 mt-2 mb-4">Monitor Glintup's subscription revenue and trends</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-8">
        {metricStats.map((m) => (
          <Card key={m.title} className="flex flex-col justify-between bg-white border shadow-sm rounded-xl dark:bg-[#232323]">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-full p-2" style={{ background: m.color + "15" }}>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-5 items-end">
        <div>
          <label className="block mb-1 text-sm font-medium">Test Email (single):</label>
          <div className="flex gap-2">
            <input
              className="border p-2 rounded text-sm"
              style={{ minWidth: 250 }}
              placeholder="Enter Email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              type="email"
            />
            <button
              className="bg-vuilder-mint text-white px-3 py-2 rounded font-medium text-sm"
              onClick={sendTestEmail}
              disabled={sendingEmail}
            >Send Test Email</button>
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Test WhatsApp (single):</label>
          <div className="flex gap-2">
            <input
              className="border p-2 rounded text-sm"
              style={{ minWidth: 200 }}
              placeholder="Enter WhatsApp number"
              value={testNumber}
              onChange={e => setTestNumber(e.target.value)}
              type="text"
            />
            <button
              className="bg-green-500 text-white px-3 py-2 rounded font-medium text-sm"
              onClick={sendTestWhatsApp}
              disabled={sendingWhatsApp}
            >Send Test WhatsApp</button>
          </div>
        </div>
        <div>
          <button
            className="bg-vuilder-indigo text-white px-3 py-2 rounded font-medium text-sm mt-2"
            onClick={sendEmailToAll}
            disabled={sendingEmail}
          >Send Email to All</button>
        </div>
        <div>
          <button
            className="bg-vuilder-indigo text-white px-3 py-2 rounded font-medium text-sm mt-2"
            onClick={sendWhatsAppToAll}
            disabled={sendingWhatsApp}
          >Send WhatsApp to All</button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-vuilder-indigo">Revenue Over Time</CardTitle>
            <CardDescription>Explore how revenue trends change across time scales</CardDescription>
          </div>
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
            <ChartContainer config={{ revenue: { label: "Revenue", color: "#3F3D56" }}} className="h-full">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.LineChart data={chartData} margin={{ top: 24, right: 30, left: 20, bottom: 30 }}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <Recharts.XAxis dataKey="date" tick={{ fill: "#6b7280" }} tickLine={{ stroke: "#e5e7eb" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <Recharts.YAxis tick={{ fill: "#6b7280" }} tickLine={{ stroke: "#e5e7eb" }} axisLine={{ stroke: "#e5e7eb" }} width={56} />
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
