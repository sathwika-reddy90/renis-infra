"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Building2, Inbox, Newspaper, Users, Images, Quote, ArrowUpRight } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { Badge } from "@/components/admin/ui";
import Skeleton from "@/components/ui/Skeleton";
import { adminApi } from "@/lib/admin/api";
import { useAdminList } from "@/lib/admin/hooks";
import { timeAgo } from "@/lib/admin/format";
import type { InquiryStatusValue } from "@/lib/admin/types";

const STATUS_TONE: Record<InquiryStatusValue, "gold" | "blue" | "green" | "red" | "neutral"> = {
  NEW: "gold",
  CONTACTED: "blue",
  QUALIFIED: "blue",
  VISIT_SCHEDULED: "green",
  NEGOTIATION: "gold",
  CLOSED_WON: "green",
  CLOSED_LOST: "red",
};

export default function DashboardPage() {
  const properties = useAdminList("properties", adminApi.properties);
  const inquiries = useAdminList("inquiries", adminApi.inquiries);
  const blogs = useAdminList("blogs", adminApi.blogs);
  const team = useAdminList("team", adminApi.team);
  const gallery = useAdminList("gallery", adminApi.gallery);
  const testimonials = useAdminList("testimonials", adminApi.testimonials);

  const recentInquiries = (inquiries.data ?? []).slice(0, 5);

  // Recent activity: latest updates across content resources.
  const activity = useMemo(() => {
    const items = [
      ...(properties.data ?? []).map((p) => ({ id: `p-${p.id}`, icon: Building2, label: "Property", title: p.title, at: p.updatedAt })),
      ...(blogs.data ?? []).map((b) => ({ id: `b-${b.id}`, icon: Newspaper, label: "Blog", title: b.title, at: b.updatedAt })),
      ...(testimonials.data ?? []).map((t) => ({ id: `t-${t.id}`, icon: Quote, label: "Testimonial", title: t.name, at: t.updatedAt })),
      ...(inquiries.data ?? []).map((i) => ({ id: `i-${i.id}`, icon: Inbox, label: "Inquiry", title: i.name, at: i.updatedAt })),
    ];
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
  }, [properties.data, blogs.data, testimonials.data, inquiries.data]);

  const activityLoading = properties.isPending || blogs.isPending || inquiries.isPending;

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Properties" value={properties.data?.length} icon={Building2} loading={properties.isPending} />
        <StatCard label="Inquiries" value={inquiries.data?.length} icon={Inbox} loading={inquiries.isPending} />
        <StatCard label="Blogs" value={blogs.data?.length} icon={Newspaper} loading={blogs.isPending} />
        <StatCard label="Team Members" value={team.data?.length} icon={Users} loading={team.isPending} />
        <StatCard label="Gallery Images" value={gallery.data?.length} icon={Images} loading={gallery.isPending} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent inquiries */}
        <section className="border border-line bg-white">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-xl font-light">Recent Inquiries</h2>
            <Link
              href="/admin/inquiries"
              className="flex items-center gap-1 text-[0.66rem] uppercase tracking-[0.16em] text-gold hover:underline"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </header>
          <div className="divide-y divide-line/70">
            {inquiries.isPending ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4">
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : recentInquiries.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted">No inquiries yet.</p>
            ) : (
              recentInquiries.map((i) => (
                <div key={i.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{i.name}</p>
                    <p className="truncate text-xs text-muted">
                      {i.interest ?? "General"} · {i.phone}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[i.status]}>{i.status}</Badge>
                  <span className="w-16 text-right text-xs text-muted">{timeAgo(i.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent activity */}
        <section className="border border-line bg-white">
          <header className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl font-light">Recent Activity</h2>
          </header>
          <div className="divide-y divide-line/70">
            {activityLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4">
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            ) : activity.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted">No activity yet.</p>
            ) : (
              activity.map(({ id, icon: Icon, label, title, at }) => (
                <div key={id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-8 w-8 flex-none items-center justify-center bg-gold/10 text-gold">
                    <Icon size={14} />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm">
                    <span className="text-muted">{label} updated —</span> {title}
                  </p>
                  <span className="w-16 text-right text-xs text-muted">{timeAgo(at)}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
