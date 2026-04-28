import { AdminLayout } from "./AdminLayout";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const enquiries = [
  { id: 1, name: "Sneha K.",   email: "sneha@example.com", subject: "Bulk order pricing", message: "Need 200 units of hex planters for an event.", status: "new"       },
  { id: 2, name: "Manish T.",  email: "manish@example.com", subject: "Material question",  message: "Is carbon-fiber nylon food safe?",                status: "responded" },
  { id: 3, name: "Pooja R.",   email: "pooja@example.com",  subject: "Custom design",      message: "Can you design a parametric vase from a sketch?", status: "new"       },
];

const AdminEnquiries = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Enquiries</h1>
        <p className="text-muted-foreground">Customer questions from the contact form.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {enquiries.map((e) => (
          <div key={e.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-aurora flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-semibold truncate">{e.subject}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${e.status === "new" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>{e.status}</span>
                </div>
                <div className="text-xs text-muted-foreground">{e.name} · {e.email}</div>
                <p className="text-sm mt-2">{e.message}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="aurora">Reply</Button>
                  <Button size="sm" variant="ghost">Mark closed</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminEnquiries;
