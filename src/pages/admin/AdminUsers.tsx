import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Mail, Shield, Loader2, Phone } from "lucide-react";
import { ApiUser, usersApi } from "@/services/api";
import { toast } from "sonner";

const initials = (s: string) => s.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0,2).join("").toUpperCase() || "?";

const AdminUsers = () => {
  const [list, setList] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.list()
      .then(setList)
      .catch((e) => toast.error("Could not load users: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">{list.length} registered makers</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">No users yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((u) => {
              const name = u.display_name || u.email || u.firebase_uid;
              return (
                <div key={u.id} className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-aurora flex items-center justify-center font-display font-bold text-primary-foreground">
                      {initials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold truncate">{name}</h3>
                        {u.role === "admin" && <Shield className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                        <Mail className="h-3 w-3" /> {u.email}
                      </div>
                      {u.phone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                          <Phone className="h-3 w-3" /> {u.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Role</div>
                      <div className="font-mono font-semibold capitalize">{u.role}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Joined</div>
                      <div className="font-mono text-sm">{new Date(u.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
