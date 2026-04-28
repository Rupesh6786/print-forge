import { AdminLayout } from "./AdminLayout";
import { Mail, Shield } from "lucide-react";

const users = [
  { name: "Sarah Chen", email: "sarah@chen.io", role: "user", orders: 12, joined: "2024-08-12" },
  { name: "Marcus Webb", email: "marcus@webb.dev", role: "user", orders: 7, joined: "2024-09-03" },
  { name: "Aiko Tanaka", email: "aiko@tanaka.jp", role: "user", orders: 24, joined: "2024-06-21" },
  { name: "Liam O'Brien", email: "liam@obrien.ie", role: "admin", orders: 3, joined: "2024-04-10" },
  { name: "Priya Sharma", email: "priya@sharma.in", role: "user", orders: 18, joined: "2024-10-01" },
  { name: "Diego Costa", email: "diego@costa.br", role: "user", orders: 5, joined: "2024-11-15" },
];

const AdminUsers = () => (
  <AdminLayout>
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">{users.length} registered makers</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div key={u.email} className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-aurora flex items-center justify-center font-display font-bold text-primary-foreground">
                {u.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold truncate">{u.name}</h3>
                  {u.role === "admin" && <Shield className="h-3.5 w-3.5 text-primary" />}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                  <Mail className="h-3 w-3" /> {u.email}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Orders</div>
                <div className="font-mono font-semibold">{u.orders}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Joined</div>
                <div className="font-mono text-sm">{u.joined}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminUsers;
