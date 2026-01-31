"use client";

import * as React from "react";
import { toast } from "sonner";

type Application = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  platform: string;
  handle: string | null;
  profile_url: string;
  followers_count: number;
  city: string | null;
  niche: string | null;
  notes: string | null;
  media_path: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

const STATUSES = ["pending", "reviewing", "approved", "rejected"];
const PLATFORMS = ["instagram", "tiktok", "youtube", "other"];

export function AmbassadorApplicationsDashboard() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [platformFilter, setPlatformFilter] = React.useState("");
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);

  const fetchApplications = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (platformFilter) params.append("platform", platformFilter);

      const res = await fetch(`/api/admin/ambassador-applications?${params}`);
      const json = await res.json();
      if (res.ok) {
        setApplications(json.data || []);
      } else {
        toast.error(json.error || "Failed to load applications");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, platformFilter]);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/ambassador-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Failed to update status");
        return;
      }

      toast.success("Status updated");
      fetchApplications();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleNotesUpdate = async (id: string, admin_notes: string) => {
    try {
      const res = await fetch(`/api/admin/ambassador-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Failed to update notes");
        return;
      }

      toast.success("Notes updated");
      fetchApplications();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewing": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ambassador Applications</h1>
          <p className="text-sm text-gray-600">Review and manage influencer partnerships</p>
        </div>
        <button
          onClick={fetchApplications}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-xs font-medium text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 rounded-md border px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700">Platform</label>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="mt-1 rounded-md border px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {applications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No applications found</div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className={`rounded-lg border bg-white p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedApp?.id === app.id ? "ring-2 ring-black" : ""
                  }`}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{app.full_name}</h3>
                      <p className="text-sm text-gray-600">{app.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded bg-gray-100 px-2 py-1">
                          {app.platform}
                        </span>
                        {app.handle && (
                          <span className="rounded bg-gray-100 px-2 py-1">
                            {app.handle}
                          </span>
                        )}
                        <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
                          {formatFollowers(app.followers_count)} followers
                        </span>
                        {app.niche && (
                          <span className="rounded bg-gray-100 px-2 py-1">
                            {app.niche}
                          </span>
                        )}
                      </div>
                      {app.admin_notes && (
                        <p className="mt-2 text-xs text-gray-500 italic">{app.admin_notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            {selectedApp ? (
              <div className="sticky top-6 rounded-lg border bg-white p-4">
                <h2 className="text-lg font-semibold mb-4">Details & Actions</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Update Status</label>
                    <select
                      value={selectedApp.status}
                      onChange={(e) => handleStatusUpdate(selectedApp.id, e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700">Admin Notes</label>
                    <textarea
                      defaultValue={selectedApp.admin_notes || ""}
                      onBlur={(e) => {
                        if (e.target.value !== selectedApp.admin_notes) {
                          handleNotesUpdate(selectedApp.id, e.target.value);
                        }
                      }}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Internal notes about this application..."
                    />
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Profile:</span>{" "}
                      <a
                        href={selectedApp.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </div>
                    {selectedApp.city && (
                      <div>
                        <span className="font-medium">City:</span> {selectedApp.city}
                      </div>
                    )}
                    {selectedApp.notes && (
                      <div>
                        <span className="font-medium">Applicant Notes:</span>
                        <p className="mt-1 text-gray-600">{selectedApp.notes}</p>
                      </div>
                    )}
                    {selectedApp.media_path && (
                      <div>
                        <span className="font-medium">Media Kit:</span> Uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="sticky top-6 rounded-lg border bg-gray-50 p-8 text-center text-sm text-gray-500">
                Select an application to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
