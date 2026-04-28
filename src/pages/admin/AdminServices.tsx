import { AdminLayout } from "./AdminLayout";
import { Wrench, Plus, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { name: "Custom STL print",  price: "From ₹150",  desc: "Upload an STL, we quote, print, and ship." },
  { name: "3D model design",   price: "From ₹999",  desc: "We design custom 3D models from your sketch." },
  { name: "Lithophane",        price: "₹599",       desc: "Photo-to-light keepsake printing." },
  { name: "Bulk B2B printing", price: "Custom",     desc: "Volume pricing for production runs." },
];

const AdminServices = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Configure the print services PrintForge offers.</p>
        </div>
        <Button variant="aurora" className="gap-1.5"><Plus className="h-4 w-4" /> New service</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.name} className="glass-card rounded-2xl p-5 flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-aurora flex items-center justify-center flex-shrink-0">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">{s.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{s.price.replace("₹","")}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">Edit</Button>
                <Button size="sm" variant="ghost">Disable</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminServices;
