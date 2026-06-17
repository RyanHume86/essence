import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { User, LogOut, Trash2, ChevronRight, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

export default function Settings() {
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    // TODO: call a backend account/data deletion function once one exists.
    // The @base44/sdk auth module exposes no user/data deletion method, so we
    // cannot permanently erase the account from the client. For now we sign the
    // user out; true deletion must be requested from the app administrator.
    base44.auth.logout();
  };

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Profile card */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
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

        {/* Account actions */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
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
                  Sign out and request account deletion
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* App info */}
        <p className="text-center text-xs text-muted-foreground/50 pb-4">
          To Do App · Version 1.0.0
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
                  Deletion is not yet automated in-app.
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-2 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Account deletion is not yet automated. Confirming will sign you out of this device. To permanently erase your account and all associated data, please contact the app administrator.
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
                  Signing out…
                </>
              ) : (
                "Sign out"
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