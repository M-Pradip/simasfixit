import { VendorHeader } from "@/components/vendor/header";
import { VendorSidebar } from "@/components/vendor/sidebar";
import { requireVendorSession } from "@/lib/auth";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireVendorSession();

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <VendorSidebar />
      <div className="min-w-0 flex-1">
        <VendorHeader session={session} />
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
