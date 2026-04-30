import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enquiriesApi } from "@/services/api";
import { toast } from "sonner";

interface Enquiry {
  id: number; name: string; email: string; phone?: string | null;
  subject?: string | null; message: string; status?: string; created_at?: string;
}

const AdminEnquiries = () => {
  const [list, setList] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enquiriesApi.list()
      .then((rows) => setList(rows as Enquiry[]))
      .catch((e) => toast.error("Could not load enquiries: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Enquiries</h1>
          <p className="text-muted-foreground">Customer questions from the contact form.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">No enquiries yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map((e) => (
              <div key={e.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-aurora flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-semibold truncate">{e.subject || "Enquiry"}</h3>
                      {e.status && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${e.status === "new" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                          {e.status}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{e.name} · {e.email}</div>
                    <p className="text-sm mt-2">{e.message}</p>
                    <div className="flex gap-2 mt-3">
                      <a href={`mailto:${e.email}`}><Button size="sm" variant="aurora">Reply</Button></a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEnquiries;
