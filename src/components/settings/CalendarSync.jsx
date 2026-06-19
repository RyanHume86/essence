import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, RefreshCw, LogIn, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { CALENDAR_CONNECTED_KEY } from "@/hooks/useTasks";

const CONNECTOR_ID = "6a352aeee5ea6ecec4029b4f";

export default function CalendarSync() {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Persist connection state so the auto-sync in useTasks only runs when linked.
  const markConnected = (value) => {
    setConnected(value);
    try {
      window.localStorage.setItem(CALENDAR_CONNECTED_KEY, value ? "true" : "false");
    } catch {
      /* ignore storage failures */
    }
  };

  // Reusable connection check — succeeds only if the user is connected.
  const checkConnection = async () => {
    try {
      await base44.functions.invoke("checkCalendarConnection", {});
      markConnected(true);
    } catch {
      markConnected(false);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (a) => {
      setAuthed(a);
      if (a) await checkConnection();
      setLoading(false);
    });
  }, []);

  const handleConnect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, "_blank");
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        checkConnection();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    markConnected(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await base44.functions.invoke("syncTasksToCalendar", { timeZone });
      const { created = 0, updated = 0, removed = 0, failed = 0 } = res.data || {};
      if (failed > 0) {
        toast({
          variant: "destructive",
          title: "Synced with errors",
          description: `${created} added · ${updated} updated · ${removed} removed · ${failed} failed.`,
        });
      } else {
        toast({ title: "Calendar synced", description: `${created} added · ${updated} updated · ${removed} removed.` });
      }
    } catch {
      toast({ variant: "destructive", title: "Sync failed", description: "Please try again." });
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="surface-raised rounded-2xl p-5 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-border border-t-highlight rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="surface-raised rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">Google Calendar</p>
          <p className="text-sm text-muted-foreground">
            {connected ? "Connected — push task due dates as events" : "Sync your task due dates to your calendar"}
          </p>
        </div>
        {connected && (
          <span className="flex items-center gap-1 text-xs font-medium text-success flex-shrink-0">
            <Check className="w-3.5 h-3.5" /> Linked
          </span>
        )}
      </div>

      {!authed ? (
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
        >
          <LogIn className="w-4 h-4" /> Sign in to connect
        </button>
      ) : connected ? (
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={syncing}
            onClick={handleSync}
            className="flex-1 py-3 rounded-xl btn-accent-3d text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 select-none"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync now"}
          </motion.button>
          <button
            onClick={handleDisconnect}
            aria-label="Disconnect Google Calendar"
            className="px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" /> Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="w-full py-3 rounded-xl btn-accent-3d text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 select-none"
        >
          <CalendarDays className="w-4 h-4" /> Connect Google Calendar
        </button>
      )}
    </div>
  );
}