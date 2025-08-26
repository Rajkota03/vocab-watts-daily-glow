import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface StatusRow {
  id: string;
  to_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  error_message?: string | null;
  message_sid?: string | null;
  from_number?: string | null;
}

const statusColors: Record<string, string> = {
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  undelivered: "bg-red-100 text-red-800",
  pending: "bg-blue-100 text-blue-800",
  sent: "bg-yellow-100 text-yellow-800",
  queued: "bg-yellow-100 text-yellow-800",
};

function isDelivered(status?: string) {
  if (!status) return false;
  return status.toLowerCase() === "delivered";
}

const DeliveryReport: React.FC = () => {
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const sinceISO = useMemo(() => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return since.toISOString();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("whatsapp_message_status")
        .select("id,to_number,status,created_at,updated_at,error_message,message_sid,from_number")
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Reduce to latest status per phone number (data is already sorted desc by created_at)
      const latestByNumber = new Map<string, StatusRow>();
      (data || []).forEach((r) => {
        if (!latestByNumber.has(r.to_number)) {
          latestByNumber.set(r.to_number, r as StatusRow);
        }
      });

      // Sort: undelivered (not delivered) first, then by updated_at desc
      const result = Array.from(latestByNumber.values()).sort((a, b) => {
        const aDelivered = isDelivered(a.status);
        const bDelivered = isDelivered(b.status);
        if (aDelivered !== bDelivered) return aDelivered ? 1 : -1; // undelivered first
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      });

      setRows(result);
    } catch (err: any) {
      console.error("Error fetching delivery report:", err);
      toast({
        title: "Failed to load delivery report",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // Optional: auto-refresh every 5 minutes to keep the report fresh
    const id = setInterval(() => {
      // Only refresh if the page is visible
      if (!document.hidden) {
        fetchReport();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const deliveredCount = rows.filter((r) => isDelivered(r.status)).length;
  const undeliveredCount = rows.length - deliveredCount;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Delivery Report (Last 24 hours)</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            Total: {rows.length}
          </Badge>
          <Badge variant="outline" className="hidden sm:inline-flex">
            Undelivered: {undeliveredCount}
          </Badge>
          <Badge variant="outline" className="hidden sm:inline-flex">
            Delivered: {deliveredCount}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchReport} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading delivery report...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No activity in the last 24 hours</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Last Status</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead className="hidden md:table-cell">Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.to_number}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[r.status?.toLowerCase()] || "bg-gray-100 text-gray-800"}>
                        {r.status || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(r.updated_at || r.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-[320px] truncate">
                      {r.error_message || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryReport;
