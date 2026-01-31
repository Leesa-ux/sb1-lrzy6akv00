"use client";

import * as React from "react";
import { toast } from "sonner";

type Application = {
  id: string;
  created_at: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  city: string;
  certifications: string[];
  portfolio_url: string;
  portfolio_paths: string[];
  next_action: string | null;
};

const STATUSES = ["incomplete", "preselected", "in_evaluation", "approved", "rejected", "needs_improvement"];
const CITIES = ["Bruxelles", "Anvers", "Liège", "Gand", "Charleroi", "Autre"];

export function ProApplicationsDashboard() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [cityFilter, setCityFilter] = React.useState("");
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [fullDetails, setFullDetails] = React.useState<any>(null);

  const fetchApplications = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (cityFilter) params.append("city", cityFilter);

      const res = await fetch(`/api/admin/pro-applications?${params}`);
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
  }, [statusFilter, cityFilter]);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/pro-applications/${id}`, {
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
      if (selectedApp?.id === id) {
        fetchFullDetails(selectedApp);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleNotesUpdate = async (id: string, next_action: string, internal_notes?: string) => {
    try {
      const body: any = {};
      if (next_action !== undefined) body.next_action = next_action;
      if (internal_notes !== undefined) body.internal_notes = internal_notes;

      const res = await fetch(`/api/admin/pro-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Failed to update notes");
        return;
      }

      toast.success("Notes updated");
      fetchApplications();
      if (selectedApp?.id === id) {
        fetchFullDetails(selectedApp);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const fetchFullDetails = async (app: Application) => {
    setSelectedApp(app);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/pro-applications/${app.id}`);
      const json = await res.json();
      if (res.ok) {
        setFullDetails(json.data);
      } else {
        toast.error(json.error || "Failed to load details");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "incomplete": return "bg-gray-100 text-gray-800";
      case "preselected": return "bg-blue-100 text-blue-800";
      case "in_evaluation": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "needs_improvement": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PRO Applications</h1>
          <p className="text-sm text-gray-600">Manage beauty professional onboarding</p>
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
          <label className="text-xs font-medium text-gray-700">City</label>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="mt-1 rounded-md border px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
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
                  onClick={() => fetchFullDetails(app)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {app.first_name} {app.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{app.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded bg-gray-100 px-2 py-1">{app.city}</span>
                        {app.certifications?.map((cert) => (
                          <span key={cert} className="rounded bg-gray-100 px-2 py-1">{cert}</span>
                        ))}
                      </div>
                      {app.next_action && (
                        <p className="mt-2 text-xs text-gray-500 italic">{app.next_action}</p>
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

                {detailsLoading ? (
                  <div className="text-sm text-gray-500">Loading details...</div>
                ) : fullDetails ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-700">Update Status</label>
                      <select
                        value={fullDetails.status}
                        onChange={(e) => handleStatusUpdate(fullDetails.id, e.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Next Action</label>
                      <textarea
                        defaultValue={fullDetails.next_action || ""}
                        onBlur={(e) => {
                          if (e.target.value !== fullDetails.next_action) {
                            handleNotesUpdate(fullDetails.id, e.target.value, undefined);
                          }
                        }}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Schedule interview, request documents, etc."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Internal Notes</label>
                      <textarea
                        defaultValue={fullDetails.internal_notes || ""}
                        onBlur={(e) => {
                          if (e.target.value !== fullDetails.internal_notes) {
                            handleNotesUpdate(fullDetails.id, undefined as any, e.target.value);
                          }
                        }}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        rows={3}
                        placeholder="Private admin notes (not visible to applicant)..."
                      />
                    </div>

                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Phone:</span> {fullDetails.phone}
                      </div>
                      <div>
                        <span className="font-medium">Address:</span> {fullDetails.address}, {fullDetails.postal_code}
                      </div>
                      <div>
                        <span className="font-medium">DOB:</span> {fullDetails.date_of_birth}
                      </div>
                      <div>
                        <span className="font-medium">Work Auth:</span> {fullDetails.work_authorized ? "Yes" : "No"}
                      </div>
                      <div>
                        <span className="font-medium">Device:</span> {fullDetails.smartphone_os}
                      </div>
                      <div>
                        <span className="font-medium">Emergency:</span> {fullDetails.emergency_contact_name} ({fullDetails.emergency_contact_phone})
                      </div>
                      {fullDetails.portfolio_url && (
                        <div>
                          <span className="font-medium">Portfolio:</span>{" "}
                          <a
                            href={fullDetails.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        </div>
                      )}
                      {fullDetails.portfolio_paths?.length > 0 && (
                        <div>
                          <span className="font-medium">Uploads:</span> {fullDetails.portfolio_paths.length} file(s)
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Select an application to view details</div>
                )}
              </div>
            ) : (
              <div className="sticky top-6 rounded-lg border bg-gray-50 p-8 text-center text-sm text-gray-500">
                Select an application to view details and take actions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
