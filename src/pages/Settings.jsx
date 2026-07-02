import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { usePrefs } from "@/hooks/usePrefs";
import { User, LogOut, Trash2, ChevronRight, ShieldAlert, CheckCircle2, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import SchemePicker from "@/components/settings/SchemePicker";
import CreaturePicker from "@/components/settings/CreaturePicker";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import CalendarSync from "@/components/settings/CalendarSync";

export default function Settings() {
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const { name, scheme, creature, notifications, setName, setScheme, setCreature, setNotifications } = usePrefs();
  const [nameInput, setNameInput] = useState(name);
  const latestName = useRef(nameInput);
  useEffect(() => { latestName.current = nameInput; }, [nameInput]);
  // Re-sync if the stored name changes elsewhere, and snap to the trimmed value
  // the store persisted after a commit.
  useEffect(() => { setNameInput(name); }, [name]);
  // Commit any pending edit if Settings unmounts before the field blurs
  // (e.g. tapping a nav link while still focused).
  useEffect(() => () => setName(latestName.current), []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      await base44.functions.invoke("deleteAccount", {});
      // Account and all tasks have been deleted server-side; signing out
      // clears the local session.
    } catch (err) {
      // Even if the backend call fails (e.g. network), still sign out so the
      // user isn't stuck in a broken state.
    }
    base44.auth.logout();
  };

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Profile card */}
        <div className="surface-raised rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {user?.full_name || "User"}
            </p>
            <p className="text-sm text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>

        {/* Personalization — change the three onboarding choices later; scheme
            re-skins every surface live via usePrefs. */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-1">
            Personalization
          </p>
          <div className="surface-raised rounded-2xl p-5 space-y-5">
            <div className="space-y-2">
              <label htmlFor="settings-name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                id="settings-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") setName(nameInput); }}
                onBlur={() => setName(nameInput)}
                placeholder="Your name"
                className="input-glow surface-raised h-11 rounded-xl border-border px-4 text-base"
              />
            </div>
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-foreground">Colour scheme</p>
              <SchemePicker value={scheme} onSelect={setScheme} />
            </div>
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-foreground">Companion</p>
              <CreaturePicker value={creature} onSelect={setCreature} />
            </div>
          </div>
        </div>

        {/* Notifications — off by construction (AD-12 / NFR7). Persisted opt-in
            only; v1 registers no push and never requests permission. */}
        <div className="surface-raised rounded-2xl overflow-hidden">
          <button
            type="button"
            role="switch"
            aria-checked={notifications}
            onClick={() => setNotifications(!notifications)}
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/50 transition-colors duration-200 select-none"
          >
            <Bell className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {notifications ? "On" : "Off — Akha never notifies you by default"}
              </p>
            </div>
            <span
              aria-hidden="true"
              className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-200 motion-reduce:transition-none ${
                notifications ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-primary-foreground transition-transform duration-200 motion-reduce:transition-none ${
                  notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Integrations */}
        <CalendarSync />

        {/* Navigation + account actions */}
        <div className="surface-raised rounded-2xl overflow-hidden divide-y divide-border">
          <Link
            to="/archive"
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors duration-200 text-left"
          >
            <CheckCircle2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">Archive</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors duration-200 text-left"
          >
            <LogOut className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">Sign out</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
        </div>

        {/* Danger zone */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-1">
            Danger Zone
          </p>
          <div className="bg-card border border-destructive/20 rounded-2xl overflow-hidden">
            <button
              onClick={() => { setConfirmText(""); setDeleteDrawerOpen(true); }}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-destructive/5 transition-colors duration-200 text-left"
            >
              <Trash2 className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete your account and all data
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* App info */}
        <p className="text-center text-xs text-muted-foreground/50 pb-4">
          Akha · Version 1.0.0
        </p>
      </div>

      {/* Delete account drawer */}
      <Drawer open={deleteDrawerOpen} onOpenChange={setDeleteDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <DrawerTitle className="text-destructive">Delete Account</DrawerTitle>
                <DrawerDescription className="text-xs mt-0.5">
                  This will permanently delete your account and all tasks.
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-2 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This action is irreversible. All your tasks and account data will be permanently deleted.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="DELETE"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive/50 transition-all text-sm font-mono"
              />
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={confirmText !== "DELETE" || isDeleting}
              onClick={handleDeleteAccount}
              className="w-full py-3.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Deleting account…
                </>
              ) : (
                "Delete my account"
              )}
            </motion.button>
            <DrawerClose asChild>
              <button className="w-full py-3.5 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm transition-colors hover:bg-muted">
                Cancel
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}