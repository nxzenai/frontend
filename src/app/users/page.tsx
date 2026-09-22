"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { toast } from "react-hot-toast";

import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  Layers3,
  ShieldCheck,
  Users,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { useAuth } from "@/contexts/AuthContext";

import userManagement, {
  Entity,
  ManagedUser,
  MODULES,
} from "@/services/userManagement.service";

const sections = [
  "Overview",
  "Access Requests",
  "Users",
  "Organizations",
  "Batches",
  "Courses",
  "Roles & Permissions",
  "Usage & Analytics",
  "Audit Logs",
] as const;

type Section = (typeof sections)[number];

const roles = [
  "super_admin",
  "admin",
  "trainer",
  "trainee",
  "guest",
];

const accountStatuses = [
  "active",
  "pending_approval",
  "suspended",
  "expired",
  "rejected",
];

function value(entity: Entity, key: string) {
  const item = entity[key];

  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return String(item);
  }

  return "";
}

function entityIsActive(entity: Entity) {
  return entity.is_active !== false;
}

function normalizeUser(
  user: ManagedUser,
  fallbackStatus = "active"
): ManagedUser {
  return {
    ...user,
    account_status:
      user.account_status || fallbackStatus,
  };
}

function ModulePicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (modules: string[]) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {MODULES.map((module) => (
        <label
          key={module}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300"
        >
          <input
            type="checkbox"
            checked={selected.includes(module)}
            onChange={(event) => {
              if (event.target.checked) {
                onChange([...selected, module]);
              } else {
                onChange(
                  selected.filter(
                    (item) => item !== module
                  )
                );
              }
            }}
          />

          <span className="capitalize">
            {module.replaceAll("_", " ")}
          </span>
        </label>
      ))}
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-slate-400">
      {label}

      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
      />
    </label>
  );
}

function Select({
  name,
  label,
  children,
  defaultValue = "",
  required = false,
}: {
  name: string;
  label: string;
  children: React.ReactNode;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-slate-400">
      {label}

      <select
        name={name}
        required={required}
        defaultValue={defaultValue || ""}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
      >
        {children}
      </select>
    </label>
  );
}

export default function UserManagementPage() {
  const { user } = useAuth();

  const [section, setSection] =
    useState<Section>("Overview");

  const [overview, setOverview] =
    useState<Record<string, number>>({});

  const [requests, setRequests] =
    useState<ManagedUser[]>([]);

  const [users, setUsers] =
    useState<ManagedUser[]>([]);

  const [organizations, setOrganizations] =
    useState<Entity[]>([]);

  const [courses, setCourses] =
    useState<Entity[]>([]);

  const [batches, setBatches] =
    useState<Entity[]>([]);

  const [roleMatrix, setRoleMatrix] =
    useState<Record<string, string[]>>({});

  const [usage, setUsage] =
    useState<Record<string, unknown>>({});

  const [audits, setAudits] =
    useState<Entity[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<ManagedUser | null>(null);

  const [selectedRequest, setSelectedRequest] =
    useState<ManagedUser | null>(null);

  const [modules, setModules] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [inactiveCutoff] = useState(
    () => Date.now() - 30 * 86400000
  );

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    account_status: "",
    organization_id: "",
    batch_id: "",
    module: "",
  });

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [
        summary,
        pending,
        people,
        orgs,
        courseRows,
        batchRows,
        roleRows,
        usageRows,
        auditRows,
      ] = await Promise.all([
        userManagement.overview(),
        userManagement.requests(),
        userManagement.users(filters),
        userManagement.organizations(),
        userManagement.courses(),
        userManagement.batches(),
        userManagement.roles(),
        userManagement.usage(),
        userManagement.audits(),
      ]);

      setOverview(summary);

      /*
       * Pending API records from older data may not have
       * account_status populated.
       */
      setRequests(
        pending.map((item) =>
          normalizeUser(
            item,
            "pending_approval"
          )
        )
      );

      /*
       * Existing users created before the approval system
       * are treated as active instead of crashing the UI.
       */
      setUsers(
        people.map((item) =>
          normalizeUser(item, "active")
        )
      );

      setOrganizations(orgs);
      setCourses(courseRows);
      setBatches(batchRows);
      setRoleMatrix(roleRows);
      setUsage(usageRows);
      setAudits(auditRows);
    } catch (error: unknown) {
      const message = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response?.data?.message;

      toast.error(
        message ??
          "Could not load User Management."
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // This effect synchronizes the management view with backend state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function run(
    action: () => Promise<unknown>,
    success: string
  ) {
    try {
      await action();
      toast.success(success);
      await load();
    } catch (error: unknown) {
      const message = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response?.data?.message;

      toast.error(
        message ?? "Action failed."
      );
    }
  }

  async function approve(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedRequest) {
      return;
    }

    const form =
      new FormData(event.currentTarget);

    const selectedRole = String(
      form.get("role") || ""
    );

    const preset = Number(
      form.get("expiry_days") || 0
    );

    let expiry:
      | string
      | undefined;

    if (preset > 0) {
      expiry = new Date(
        Date.now() +
          preset * 86400000
      ).toISOString();
    } else {
      const customExpiry = String(
        form.get("access_end_at") || ""
      );

      expiry =
        customExpiry || undefined;
    }

    /*
     * Guest accounts must always expire.
     */
    if (
      selectedRole === "guest" &&
      !expiry
    ) {
      toast.error(
        "Guest users must have an access expiry."
      );
      return;
    }

    await run(
      () =>
        userManagement.approve(
          selectedRequest.id,
          {
            role: selectedRole,

            organization_id:
              form.get(
                "organization_id"
              ) || null,

            course_id:
              form.get(
                "course_id"
              ) || null,

            batch_id:
              form.get(
                "batch_id"
              ) || null,

            allowed_modules:
              modules,

            denied_modules: [],

            access_start_at:
              new Date().toISOString(),

            access_end_at:
              expiry,
          }
        ),
      "User approved and notified."
    );

    setSelectedRequest(null);
    setModules([]);
  }

  async function createUser(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form =
      new FormData(event.currentTarget);

    const selectedRole = String(
      form.get("role") || ""
    );

    const accessEnd = String(
      form.get("access_end_at") || ""
    );

    if (
      selectedRole === "guest" &&
      !accessEnd
    ) {
      toast.error(
        "Guest users must have an access expiry."
      );
      return;
    }

    await run(
      () =>
        userManagement.createUser({
          email: form.get("email"),
          username:
            form.get("username"),
          full_name:
            form.get("full_name"),
          password:
            form.get("password"),
          role: selectedRole,

          organization_id:
            form.get(
              "organization_id"
            ) || null,

          course_id: null,

          batch_id:
            form.get("batch_id") ||
            null,

          allowed_modules:
            modules,

          denied_modules: [],

          access_end_at:
            accessEnd || null,
        }),
      "User created."
    );

    event.currentTarget.reset();
    setModules([]);
  }

  async function importCsv(
    file?: File
  ) {
    if (!file) {
      return;
    }

    const text =
      await file.text();

    const lines = text
      .trim()
      .split(/\r?\n/);

    const headers =
      lines
        .shift()
        ?.split(",")
        .map((item) =>
          item.trim()
        ) ?? [];

    const records = lines
      .filter(Boolean)
      .map((line) =>
        Object.fromEntries(
          line
            .split(",")
            .map(
              (
                item,
                index
              ) => [
                headers[index],
                item.trim(),
              ]
            )
        )
      )
      .map((row) => ({
        ...row,

        organization_id:
          row.organization_id ||
          null,

        course_id:
          row.course_id ||
          null,

        batch_id:
          row.batch_id ||
          null,

        allowed_modules:
          (
            row.allowed_modules ||
            ""
          )
            .split("|")
            .filter(Boolean),

        denied_modules: [],

        access_end_at:
          row.access_end_at ||
          null,
      }));

    await run(
      () =>
        userManagement.bulkUsers(
          records
        ),
      "CSV users processed."
    );
  }

  const orgOptions =
    organizations.map((item) => (
      <option
        key={item.id}
        value={item.id}
      >
        {value(item, "name")}
      </option>
    ));

  const courseOptions =
    courses.map((item) => (
      <option
        key={item.id}
        value={item.id}
      >
        {value(item, "name")}
      </option>
    ));

  const batchOptions =
    batches.map((item) => (
      <option
        key={item.id}
        value={item.id}
      >
        {value(item, "name")}
      </option>
    ));

  const summary =
    usage.summary as
      | {
          active_users?: number;
          sessions?: number;
          events?: number;
          module_usage?: Record<
            string,
            number
          >;
        }
      | undefined;

  async function filterUsage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form =
      new FormData(event.currentTarget);

    const query =
      Object.fromEntries(
        [...form.entries()]
          .map(
            ([key, item]) =>
              [
                key,
                String(item),
              ] as const
          )
          .filter(
            ([, item]) =>
              Boolean(item)
          )
      );

    try {
      setUsage(
        await userManagement.usage(
          query
        )
      );
    } catch {
      toast.error(
        "Could not load the selected usage view."
      );
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout
        compactSidebar
      >
        {/* Header */}

        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-blue-400">
              Access control
            </p>

            <h1 className="mt-1 text-3xl font-bold text-white">
              User Management
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Accounts, tenant
              entitlements, training
              cohorts, usage, and
              audit.
            </p>
          </div>

          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs capitalize text-slate-300">
            {user?.role
              ?.replaceAll(
                "_",
                " "
              ) || "user"}
          </span>
        </header>

        {/* Section navigation */}

        <nav
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
          aria-label="User management sections"
        >
          {sections.map((item) => (
            <button
              key={item}
              onClick={() =>
                setSection(item)
              }
              className={`shrink-0 rounded-lg px-3 py-2 text-sm transition ${
                section === item
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {loading && (
          <p className="mb-4 text-sm text-slate-400">
            Refreshing access data…
          </p>
        )}

        {/* Overview */}

        {section ===
          "Overview" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [
                "Total users",
                "total_users",
                Users,
              ],

              [
                "Pending",
                "pending_approval",
                ClipboardList,
              ],

              [
                "Active",
                "active",
                ShieldCheck,
              ],

              [
                "Suspended / expired",
                "inactive",
                Layers3,
              ],

              [
                "Guests",
                "guests",
                Users,
              ],

              [
                "Organizations",
                "organizations",
                Building2,
              ],

              [
                "Active batches",
                "active_batches",
                BookOpen,
              ],
            ].map(
              ([
                label,
                key,
                Icon,
              ]) => {
                const count =
                  key ===
                  "inactive"
                    ? (overview.suspended ||
                        0) +
                      (overview.expired ||
                        0)
                    : overview[
                        String(key)
                      ] || 0;

                const CardIcon =
                  Icon as typeof Users;

                return (
                  <article
                    key={String(
                      key
                    )}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <CardIcon
                      className="mb-4 text-blue-400"
                      size={22}
                    />

                    <p className="text-3xl font-bold text-white">
                      {count}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {String(
                        label
                      )}
                    </p>
                  </article>
                );
              }
            )}
          </div>
        )}

        {/* Access requests */}

        {section ===
          "Access Requests" && (
          <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
            <Panel title="Pending registrations">
              <div className="space-y-2">
                {requests.length ===
                0 ? (
                  <Empty text="No pending requests." />
                ) : (
                  requests.map(
                    (item) => (
                      <button
                        key={
                          item.id
                        }
                        onClick={() => {
                          setSelectedRequest(
                            item
                          );

                          setModules(
                            []
                          );
                        }}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-800 p-4 text-left transition hover:border-blue-500"
                      >
                        <span>
                          <b className="block text-white">
                            {item.full_name ||
                              "Unnamed user"}
                          </b>

                          <span className="text-xs text-slate-400">
                            {
                              item.email
                            }
                          </span>
                        </span>

                        <span className="text-xs text-amber-300">
                          Review
                        </span>
                      </button>
                    )
                  )
                )}
              </div>
            </Panel>

            <Panel title="Approval assignment">
              {selectedRequest ? (
                <form
                  onSubmit={
                    approve
                  }
                  className="space-y-4"
                >
                  <p className="text-sm text-slate-300">
                    Approving{" "}
                    <b>
                      {
                        selectedRequest.email
                      }
                    </b>
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      name="role"
                      label="Role"
                      required
                      defaultValue="trainee"
                    >
                      {roles.map(
                        (item) => (
                          <option
                            key={
                              item
                            }
                            value={
                              item
                            }
                          >
                            {item.replaceAll(
                              "_",
                              " "
                            )}
                          </option>
                        )
                      )}
                    </Select>

                    <Select
                      name="organization_id"
                      label="Organization"
                    >
                      <option value="">
                        None /
                        global
                      </option>

                      {
                        orgOptions
                      }
                    </Select>

                    <Select
                      name="course_id"
                      label="Course"
                    >
                      <option value="">
                        None
                      </option>

                      {
                        courseOptions
                      }
                    </Select>

                    <Select
                      name="batch_id"
                      label="Batch"
                    >
                      <option value="">
                        None
                      </option>

                      {
                        batchOptions
                      }
                    </Select>

                    <Select
                      name="expiry_days"
                      label="Guest / access duration"
                    >
                      <option value="">
                        Custom /
                        no expiry
                      </option>

                      {[
                        1, 3, 7,
                        14, 30,
                      ].map(
                        (day) => (
                          <option
                            key={
                              day
                            }
                            value={
                              day
                            }
                          >
                            {day}{" "}
                            day
                            {day >
                            1
                              ? "s"
                              : ""}
                          </option>
                        )
                      )}
                    </Select>

                    <Field
                      name="access_end_at"
                      label="Custom access end"
                      type="datetime-local"
                    />
                  </div>

                  <ModulePicker
                    selected={
                      modules
                    }
                    onChange={
                      setModules
                    }
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void run(
                          () =>
                            userManagement.reject(
                              selectedRequest.id,
                              "Rejected by administrator"
                            ),
                          "Request rejected."
                        )
                      }
                      className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-300"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              ) : (
                <Empty text="Select a request to review." />
              )}
            </Panel>
          </div>
        )}

        {/* Users */}

        {section === "Users" && (
          <div className="space-y-5">
            <Panel title="Search and filters">
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <Field
                  name="search"
                  label="Search"
                  defaultValue={
                    filters.search
                  }
                />

                <Select
                  name="role"
                  label="Role"
                  defaultValue={
                    filters.role
                  }
                >
                  <option value="">
                    All
                  </option>

                  {roles.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item.replaceAll(
                          "_",
                          " "
                        )}
                      </option>
                    )
                  )}
                </Select>

                <Select
                  name="status"
                  label="Status"
                  defaultValue={
                    filters.account_status
                  }
                >
                  <option value="">
                    All
                  </option>

                  {accountStatuses.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item.replaceAll(
                          "_",
                          " "
                        )}
                      </option>
                    )
                  )}
                </Select>

                <Select
                  name="org"
                  label="Organization"
                  defaultValue={
                    filters.organization_id
                  }
                >
                  <option value="">
                    All
                  </option>

                  {orgOptions}
                </Select>

                <Select
                  name="batch"
                  label="Batch"
                  defaultValue={
                    filters.batch_id
                  }
                >
                  <option value="">
                    All
                  </option>

                  {
                    batchOptions
                  }
                </Select>

                <Select
                  name="module"
                  label="Module"
                  defaultValue={
                    filters.module
                  }
                >
                  <option value="">
                    All
                  </option>

                  {MODULES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item.replaceAll(
                          "_",
                          " "
                        )}
                      </option>
                    )
                  )}
                </Select>
              </div>

              <button
                type="button"
                onClick={() => {
                  const controls =
                    document.querySelectorAll<
                      | HTMLInputElement
                      | HTMLSelectElement
                    >(
                      "[name=search],[name=role],[name=status],[name=org],[name=batch],[name=module]"
                    );

                  const vals =
                    Array.from(
                      controls
                    ).map(
                      (item) =>
                        item.value
                    );

                  setFilters({
                    search:
                      vals[0] ||
                      "",
                    role:
                      vals[1] ||
                      "",
                    account_status:
                      vals[2] ||
                      "",
                    organization_id:
                      vals[3] ||
                      "",
                    batch_id:
                      vals[4] ||
                      "",
                    module:
                      vals[5] ||
                      "",
                  });
                }}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
              >
                Apply filters
              </button>
            </Panel>

            {user?.role ===
              "super_admin" && (
              <Panel title="Create or bulk import">
                <form
                  onSubmit={
                    createUser
                  }
                  className="space-y-4"
                >
                  <div className="grid gap-3 md:grid-cols-4">
                    <Field
                      name="full_name"
                      label="Full name"
                      required
                    />

                    <Field
                      name="username"
                      label="Username"
                      required
                    />

                    <Field
                      name="email"
                      label="Email"
                      type="email"
                      required
                    />

                    <Field
                      name="password"
                      label="Temporary password"
                      type="password"
                      required
                    />

                    <Select
                      name="role"
                      label="Role"
                      required
                      defaultValue="trainee"
                    >
                      {roles.map(
                        (item) => (
                          <option
                            key={
                              item
                            }
                            value={
                              item
                            }
                          >
                            {item.replaceAll(
                              "_",
                              " "
                            )}
                          </option>
                        )
                      )}
                    </Select>

                    <Select
                      name="organization_id"
                      label="Organization"
                    >
                      <option value="">
                        None
                      </option>

                      {
                        orgOptions
                      }
                    </Select>

                    <Select
                      name="batch_id"
                      label="Batch"
                    >
                      <option value="">
                        None
                      </option>

                      {
                        batchOptions
                      }
                    </Select>

                    <Field
                      name="access_end_at"
                      label="Access end"
                      type="datetime-local"
                    />
                  </div>

                  <ModulePicker
                    selected={
                      modules
                    }
                    onChange={
                      setModules
                    }
                  />

                  <div className="flex flex-wrap gap-3">
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                      Create user
                    </button>

                    <label className="cursor-pointer rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300">
                      Import CSV

                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={(
                          event
                        ) =>
                          void importCsv(
                            event
                              .target
                              .files?.[0]
                          )
                        }
                      />
                    </label>

                    <span className="self-center text-xs text-slate-500">
                      CSV:
                      full_name,
                      username,
                      email,
                      password,
                      role,
                      organization_id,
                      course_id,
                      batch_id,
                      allowed_modules,
                      access_end_at
                    </span>
                  </div>
                </form>
              </Panel>
            )}

            <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
              <Panel
                title={`Users (${users.length})`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-slate-500">
                      <tr>
                        <th className="p-3">
                          User
                        </th>

                        <th>
                          Role
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Last
                          login
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                            onClick={() =>
                              setSelectedUser(
                                item
                              )
                            }
                            className="cursor-pointer border-t border-slate-800 transition hover:bg-slate-800/50"
                          >
                            <td className="p-3">
                              <b className="block text-white">
                                {item.full_name ||
                                  "Unnamed user"}
                              </b>

                              <span className="text-xs text-slate-500">
                                {
                                  item.email
                                }
                              </span>
                            </td>

                            <td className="capitalize text-slate-300">
                              {item.role?.replaceAll(
                                "_",
                                " "
                              ) ||
                                "—"}
                            </td>

                            <td>
                              <Status
                                value={
                                  item.account_status
                                }
                              />
                            </td>

                            <td className="text-slate-400">
                              {item.last_login
                                ? new Date(
                                    item.last_login
                                  ).toLocaleString()
                                : "Never"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <UserDetails
                user={
                  selectedUser
                }
                organizations={
                  organizations
                }
                batches={
                  batches
                }
                canPermanentlyDelete={
                  user?.role ===
                  "super_admin"
                }
                onRun={run}
              />
            </div>
          </div>
        )}

        {/* Organizations */}

        {section ===
          "Organizations" && (
          <EntitySection
            title="Organizations"
            entities={
              organizations
            }
            canEdit={
              user?.role ===
              "super_admin"
            }
            renderForm={(
              item
            ) => (
              <OrganizationForm
                key={
                  item?.id ??
                  "new"
                }
                item={item}
                onRun={run}
              />
            )}
          />
        )}

        {/* Courses */}

        {section ===
          "Courses" && (
          <EntitySection
            title="Course templates"
            entities={courses}
            canEdit={
              user?.role ===
              "super_admin"
            }
            renderForm={(
              item
            ) => (
              <CourseForm
                key={
                  item?.id ??
                  "new"
                }
                item={item}
                organizations={
                  organizations
                }
                onRun={run}
              />
            )}
          />
        )}

        {/* Batches */}

        {section ===
          "Batches" && (
          <EntitySection
            title="Batches"
            entities={batches}
            canEdit={
              user?.role ===
              "super_admin"
            }
            renderForm={(
              item
            ) => (
              <BatchForm
                key={
                  item?.id ??
                  "new"
                }
                item={item}
                organizations={
                  organizations
                }
                courses={
                  courses
                }
                users={users}
                onRun={run}
              />
            )}
          />
        )}

        {/* Roles */}

        {section ===
          "Roles & Permissions" && (
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(
              roleMatrix
            ).map(
              ([
                role,
                allowed,
              ]) => (
                <Panel
                  key={role}
                  title={role.replaceAll(
                    "_",
                    " "
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    {(
                      allowed ??
                      []
                    ).map(
                      (
                        item
                      ) => (
                        <span
                          key={
                            item
                          }
                          className="rounded-full bg-blue-500/10 px-3 py-1 text-xs capitalize text-blue-300"
                        >
                          {item.replaceAll(
                            "_",
                            " "
                          )}
                        </span>
                      )
                    )}
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Organization
                    limits and
                    course, batch,
                    and user
                    overrides are
                    applied to these
                    defaults.
                  </p>
                </Panel>
              )
            )}
          </div>
        )}

        {/* Usage */}

        {section ===
          "Usage & Analytics" && (
          <div className="space-y-5">
            <Panel title="Usage view">
              <form
                onSubmit={
                  filterUsage
                }
                className="grid gap-3 md:grid-cols-5"
              >
                <Select
                  name="organization_id"
                  label="Organization"
                >
                  <option value="">
                    Platform
                  </option>

                  {orgOptions}
                </Select>

                <Select
                  name="batch_id"
                  label="Batch"
                >
                  <option value="">
                    All batches
                  </option>

                  {
                    batchOptions
                  }
                </Select>

                <Select
                  name="user_id"
                  label="User"
                >
                  <option value="">
                    All users
                  </option>

                  {users.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {item.full_name ||
                          item.email}
                      </option>
                    )
                  )}
                </Select>

                <Select
                  name="module"
                  label="Module"
                >
                  <option value="">
                    All modules
                  </option>

                  {MODULES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item.replaceAll(
                          "_",
                          " "
                        )}
                      </option>
                    )
                  )}
                </Select>

                <button className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                  Apply view
                </button>
              </form>
            </Panel>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                label="Active users"
                value={
                  summary?.active_users ||
                  0
                }
              />

              <Metric
                label="Sessions"
                value={
                  summary?.sessions ||
                  0
                }
              />

              <Metric
                label="Tracked events"
                value={
                  summary?.events ||
                  0
                }
              />

              <Metric
                label="Last login coverage"
                value={
                  users.filter(
                    (item) =>
                      Boolean(
                        item.last_login
                      )
                  ).length
                }
              />
            </div>

            <Panel title="Module usage">
              <div className="space-y-3">
                {Object.entries(
                  summary?.module_usage ||
                    {}
                ).length ===
                0 ? (
                  <Empty text="No module usage recorded yet." />
                ) : (
                  Object.entries(
                    summary?.module_usage ||
                      {}
                  ).map(
                    ([
                      module,
                      count,
                    ]) => (
                      <div
                        key={
                          module
                        }
                        className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm"
                      >
                        <span className="capitalize text-slate-300">
                          {module.replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                        <b>
                          {
                            count
                          }
                        </b>
                      </div>
                    )
                  )
                )}
              </div>
            </Panel>

            <Panel title="Inactive users">
              <div className="space-y-2">
                {users.filter(
                  (item) =>
                    !item.last_login ||
                    new Date(
                      item.last_login
                    ).getTime() <
                      inactiveCutoff
                ).length ===
                0 ? (
                  <Empty text="No inactive users." />
                ) : (
                  users
                    .filter(
                      (item) =>
                        !item.last_login ||
                        new Date(
                          item.last_login
                        ).getTime() <
                          inactiveCutoff
                    )
                    .map(
                      (item) => (
                        <p
                          key={
                            item.id
                          }
                          className="text-sm text-slate-300"
                        >
                          {item.full_name ||
                            item.email}

                          <span className="text-slate-500">
                            {" "}
                            —{" "}
                            {item.last_login
                              ? "inactive 30+ days"
                              : "never logged in"}
                          </span>
                        </p>
                      )
                    )
                )}
              </div>
            </Panel>
          </div>
        )}

        {/* Audit */}

        {section ===
          "Audit Logs" && (
          <Panel title="Access-control audit">
            <div className="space-y-2">
              {audits.length ===
              0 ? (
                <Empty text="No access-control audit records yet." />
              ) : (
                audits.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="grid gap-1 rounded-lg border border-slate-800 p-3 text-sm md:grid-cols-[1fr_1fr_auto]"
                    >
                      <b className="capitalize">
                        {value(
                          item,
                          "action"
                        ).replaceAll(
                          "_",
                          " "
                        ) ||
                          "Unknown action"}
                      </b>

                      <span className="text-slate-400">
                        Target:{" "}
                        {value(
                          item,
                          "target_id"
                        ) ||
                          "—"}
                      </span>

                      <time className="text-xs text-slate-500">
                        {value(
                          item,
                          "created_at"
                        )
                          ? new Date(
                              value(
                                item,
                                "created_at"
                              )
                            ).toLocaleString()
                          : ""}
                      </time>
                    </div>
                  )
                )
              )}
            </div>
          </Panel>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 text-lg font-semibold capitalize text-white">
        {title}
      </h2>

      {children}
    </section>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <p className="py-8 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}

function Status({
  value,
}: {
  value?: string | null;
}) {
  const normalized =
    value?.trim() || "unknown";

  const styleMap: Record<
    string,
    string
  > = {
    active:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",

    pending_approval:
      "bg-amber-500/10 text-amber-300 border-amber-500/20",

    suspended:
      "bg-orange-500/10 text-orange-300 border-orange-500/20",

    expired:
      "bg-slate-500/10 text-slate-300 border-slate-500/20",

    rejected:
      "bg-red-500/10 text-red-300 border-red-500/20",

    deleted:
      "bg-red-500/10 text-red-400 border-red-500/20",

    unknown:
      "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const styles =
    styleMap[normalized] ||
    styleMap.unknown;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs capitalize ${styles}`}
    >
      {normalized.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}

function Metric({
  label,
  value: metric,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <BarChart3 className="mb-3 text-blue-400" />

      <p className="text-3xl font-bold text-white">
        {metric}
      </p>

      <p className="text-sm text-slate-400">
        {label}
      </p>
    </article>
  );
}

function UserDetails({
  user,
  organizations,
  batches,
  canPermanentlyDelete,
  onRun,
}: {
  user: ManagedUser | null;
  organizations: Entity[];
  batches: Entity[];
  canPermanentlyDelete: boolean;

  onRun: (
    action: () => Promise<unknown>,
    message: string
  ) => Promise<void>;
}) {
  const [tab, setTab] =
    useState("Profile");

  if (!user) {
    return (
      <Panel title="User details">
        <Empty text="Select a user." />
      </Panel>
    );
  }

  const status =
    user.account_status ||
    "active";

  return (
    <Panel
      title={
        user.full_name ||
        user.email ||
        "User"
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          "Profile",
          "Access",
          "Activity",
          "Security",
          "Audit",
        ].map((item) => (
          <button
            key={item}
            onClick={() =>
              setTab(item)
            }
            className={`rounded px-2 py-1 text-xs ${
              tab === item
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Profile" && (
        <div className="space-y-2 text-sm text-slate-300">
          <p>{user.email}</p>

          <p>
            @
            {user.username ||
              "—"}
          </p>

          <Status
            value={status}
          />
        </div>
      )}

      {tab === "Access" && (
        <form
          onSubmit={(event) => {
            event.preventDefault();

            const form =
              new FormData(
                event.currentTarget
              );

            void onRun(
              () =>
                userManagement.updateUser(
                  user.id,
                  {
                    role:
                      form.get(
                        "role"
                      ),

                    organization_id:
                      form.get(
                        "organization_id"
                      ) ||
                      null,

                    batch_id:
                      form.get(
                        "batch_id"
                      ) ||
                      null,
                  }
                ),
              "Access updated."
            );
          }}
          className="grid gap-3"
        >
          <Select
            name="role"
            label="Role"
            defaultValue={
              user.role || ""
            }
          >
            {roles.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item.replaceAll(
                    "_",
                    " "
                  )}
                </option>
              )
            )}
          </Select>

          <Select
            name="organization_id"
            label="Organization"
            defaultValue={
              user.organization_id ||
              ""
            }
          >
            <option value="">
              None
            </option>

            {organizations.map(
              (item) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.id
                  }
                >
                  {value(
                    item,
                    "name"
                  )}
                </option>
              )
            )}
          </Select>

          <Select
            name="batch_id"
            label="Batch"
            defaultValue={
              user.batch_id || ""
            }
          >
            <option value="">
              None
            </option>

            {batches.map(
              (item) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.id
                  }
                >
                  {value(
                    item,
                    "name"
                  )}
                </option>
              )
            )}
          </Select>

          <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
            Save role / moves
          </button>
        </form>
      )}

      {tab ===
        "Activity" && (
        <p className="text-sm text-slate-400">
          Last login:{" "}
          {user.last_login
            ? new Date(
                user.last_login
              ).toLocaleString()
            : "Never"}
        </p>
      )}

      {tab ===
        "Security" && (
        <div className="flex flex-wrap gap-2">
          {status ===
          "suspended" ? (
            <button
              onClick={() =>
                void onRun(
                  () =>
                    userManagement.lifecycle(
                      user.id,
                      "reactivate"
                    ),
                  "User reactivated."
                )
              }
              className="rounded bg-emerald-600 px-3 py-2 text-xs text-white"
            >
              Reactivate
            </button>
          ) : (
            <button
              onClick={() =>
                void onRun(
                  () =>
                    userManagement.lifecycle(
                      user.id,
                      "suspend"
                    ),
                  "User suspended."
                )
              }
              className="rounded bg-amber-600 px-3 py-2 text-xs text-white"
            >
              Suspend
            </button>
          )}

          <button
            onClick={() =>
              void onRun(
                () =>
                  userManagement.lifecycle(
                    user.id,
                    "expire"
                  ),
                "Access expired."
              )
            }
            className="rounded bg-red-500/20 px-3 py-2 text-xs text-red-300"
          >
            Expire now
          </button>

          <button
            onClick={() => {
              const date =
                prompt(
                  "New expiry date/time (for example 2026-10-01T18:00)"
                );

              if (!date) {
                return;
              }

              const parsed =
                new Date(date);

              if (
                Number.isNaN(
                  parsed.getTime()
                )
              ) {
                toast.error(
                  "Invalid expiry date."
                );
                return;
              }

              void onRun(
                () =>
                  userManagement.lifecycle(
                    user.id,
                    "extend",
                    parsed.toISOString()
                  ),
                "Expiry extended."
              );
            }}
            className="rounded bg-slate-700 px-3 py-2 text-xs text-white"
          >
            Extend
          </button>

          <button
            onClick={() =>
              void onRun(
                () =>
                  userManagement.lifecycle(
                    user.id,
                    "reset_access"
                  ),
                "Access reset."
              )
            }
            className="rounded bg-slate-700 px-3 py-2 text-xs text-white"
          >
            Reset access
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  "Deactivate this user?"
                )
              ) {
                void onRun(
                  () =>
                    userManagement.deleteUser(
                      user.id
                    ),
                  "User deactivated."
                );
              }
            }}
            className="rounded bg-red-600 px-3 py-2 text-xs text-white"
          >
            Delete
          </button>

          {canPermanentlyDelete && (
            <button
              onClick={() => {
                const confirmation =
                  prompt(
                    "Type PERMANENTLY DELETE to remove this user."
                  );

                if (
                  confirmation ===
                  "PERMANENTLY DELETE"
                ) {
                  void onRun(
                    () =>
                      userManagement.deleteUser(
                        user.id,
                        true,
                        confirmation
                      ),
                    "User permanently deleted; audit retained."
                  );
                }
              }}
              className="rounded border border-red-500 px-3 py-2 text-xs text-red-300"
            >
              Permanent delete
            </button>
          )}
        </div>
      )}

      {tab === "Audit" && (
        <p className="text-sm text-slate-400">
          Use Audit Logs filtered
          by target ID:{" "}
          {user.id}
        </p>
      )}
    </Panel>
  );
}

function EntitySection({
  title,
  entities,
  canEdit,
  renderForm,
}: {
  title: string;
  entities: Entity[];
  canEdit: boolean;
  renderForm: (
    item: Entity | null
  ) => React.ReactNode;
}) {
  const [
    selected,
    setSelected,
  ] =
    useState<Entity | null>(
      null
    );

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
      <Panel title={title}>
        <div className="space-y-2">
          {canEdit && (
            <button
              onClick={() =>
                setSelected(null)
              }
              className="mb-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
            >
              Create new
            </button>
          )}

          {entities.length ===
          0 ? (
            <Empty
              text={`No ${title.toLowerCase()} yet.`}
            />
          ) : (
            entities.map(
              (item) => (
                <button
                  key={
                    item.id
                  }
                  onClick={() =>
                    setSelected(
                      item
                    )
                  }
                  className="flex w-full justify-between rounded-lg border border-slate-800 p-3 text-left text-sm transition hover:border-blue-500"
                >
                  <b>
                    {value(
                      item,
                      "name"
                    ) ||
                      "Unnamed"}
                  </b>

                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      entityIsActive(item)
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {entityIsActive(item)
                      ? "Active"
                      : "Inactive"}
                  </span>
                </button>
              )
            )
          )}
        </div>
      </Panel>

      <Panel
        title={
          selected
            ? `Edit ${
                value(
                  selected,
                  "name"
                ) ||
                "record"
              }`
            : "Create"
        }
      >
        {canEdit ? (
          renderForm(
            selected
          )
        ) : (
          <Empty text="Super Admin manages this section." />
        )}
      </Panel>
    </div>
  );
}

function EntityLifecycleActions({
  item,
  entityLabel,
  deactivateLabel = "Deactivate",
  onRun,
  deactivate,
  reactivate,
  permanentlyDelete,
}: {
  item: Entity;
  entityLabel: string;
  deactivateLabel?: string;
  onRun: (
    action: () => Promise<unknown>,
    message: string
  ) => Promise<void>;
  deactivate: () => Promise<unknown>;
  reactivate: () => Promise<unknown>;
  permanentlyDelete: (
    confirmation: string
  ) => Promise<unknown>;
}) {
  const active = entityIsActive(item);

  return (
    <div className="inline-flex flex-wrap gap-2">
      {active ? (
        <button
          type="button"
          onClick={() =>
            void onRun(
              deactivate,
              `${entityLabel} deactivated.`
            )
          }
          className="rounded-lg bg-amber-500/15 px-4 py-2 text-sm text-amber-300"
        >
          {deactivateLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={() =>
            void onRun(
              reactivate,
              `${entityLabel} reactivated.`
            )
          }
          className="rounded-lg bg-emerald-500/15 px-4 py-2 text-sm text-emerald-300"
        >
          Reactivate
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          const confirmation = prompt(
            `Type PERMANENTLY DELETE to permanently delete this ${entityLabel.toLowerCase()}.`
          );
          if (
            confirmation ===
            "PERMANENTLY DELETE"
          ) {
            void onRun(
              () =>
                permanentlyDelete(
                  confirmation
                ),
              `${entityLabel} permanently deleted.`
            );
          }
        }}
        className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-300"
      >
        Permanent Delete
      </button>
    </div>
  );
}

function OrganizationForm({
  item,
  onRun,
}: {
  item: Entity | null;

  onRun: (
    action: () => Promise<unknown>,
    message: string
  ) => Promise<void>;
}) {
  const [
    selected,
    setSelected,
  ] = useState<string[]>(
    Array.isArray(
      item?.enabled_modules
    )
      ? (item?.enabled_modules as string[])
      : []
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const form =
          new FormData(
            event.currentTarget
          );

        const payload = {
          name:
            form.get("name"),

          enabled_modules:
            selected,

          user_limit:
            Number(
              form.get(
                "user_limit"
              )
            ),

          valid_from:
            form.get(
              "valid_from"
            ) || null,

          valid_until:
            form.get(
              "valid_until"
            ) || null,

          organization_type:
            form.get(
              "organization_type"
            ),

          plan:
            form.get("plan"),

          is_active: item
            ? entityIsActive(item)
            : true,
        };

        void onRun(
          () =>
            item
              ? userManagement.updateOrganization(
                  item.id,
                  payload
                )
              : userManagement.createOrganization(
                  payload
                ),
          "Organization saved."
        );
      }}
      className="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          name="name"
          label="Name"
          required
          defaultValue={
            item
              ? value(
                  item,
                  "name"
                )
              : ""
          }
        />

        <Field
          name="user_limit"
          label="User limit"
          type="number"
          required
          defaultValue={
            item
              ? value(
                  item,
                  "user_limit"
                )
              : 100
          }
        />

        <Field
          name="organization_type"
          label="Type"
          defaultValue={
            item
              ? value(
                  item,
                  "organization_type"
                )
              : "customer"
          }
        />

        <Field
          name="plan"
          label="Plan"
          defaultValue={
            item
              ? value(
                  item,
                  "plan"
                )
              : "standard"
          }
        />

        <Field
          name="valid_from"
          label="Valid from"
          type="datetime-local"
        />

        <Field
          name="valid_until"
          label="Valid until"
          type="datetime-local"
        />
      </div>

      <ModulePicker
        selected={selected}
        onChange={
          setSelected
        }
      />

      <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
        Save organization
      </button>

      {item && (
        <EntityLifecycleActions
          item={item}
          entityLabel="Organization"
          onRun={onRun}
          deactivate={() =>
            userManagement.deactivateOrganization(
              item.id
            )
          }
          reactivate={() =>
            userManagement.reactivateOrganization(
              item.id
            )
          }
          permanentlyDelete={(confirmation) =>
            userManagement.permanentlyDeleteOrganization(
              item.id,
              confirmation
            )
          }
        />
      )}
    </form>
  );
}

function CourseForm({
  item,
  organizations,
  onRun,
}: {
  item: Entity | null;
  organizations: Entity[];

  onRun: (
    action: () => Promise<unknown>,
    message: string
  ) => Promise<void>;
}) {
  const [
    selected,
    setSelected,
  ] = useState<string[]>(
    Array.isArray(
      item?.default_modules
    )
      ? (item?.default_modules as string[])
      : []
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const form =
          new FormData(
            event.currentTarget
          );

        const payload = {
          name:
            form.get("name"),

          organization_id:
            form.get(
              "organization_id"
            ) || null,

          default_modules:
            selected,

          default_duration_days:
            Number(
              form.get(
                "default_duration_days"
              )
            ),

          description:
            form.get(
              "description"
            ),

          is_active: item
            ? entityIsActive(item)
            : true,
        };

        void onRun(
          () =>
            item
              ? userManagement.updateCourse(
                  item.id,
                  payload
                )
              : userManagement.createCourse(
                  payload
                ),
          "Course saved."
        );
      }}
      className="space-y-4"
    >
      <Field
        name="name"
        label="Course name"
        required
        defaultValue={
          item
            ? value(
                item,
                "name"
              )
            : ""
        }
      />

      <Select
        name="organization_id"
        label="Organization"
        defaultValue={
          item
            ? value(
                item,
                "organization_id"
              )
            : ""
        }
      >
        <option value="">
          Global
        </option>

        {organizations.map(
          (row) => (
            <option
              key={row.id}
              value={row.id}
            >
              {value(
                row,
                "name"
              )}
            </option>
          )
        )}
      </Select>

      <Field
        name="default_duration_days"
        label="Default duration (days)"
        type="number"
        required
        defaultValue={
          item
            ? value(
                item,
                "default_duration_days"
              )
            : 30
        }
      />

      <Field
        name="description"
        label="Description"
        defaultValue={
          item
            ? value(
                item,
                "description"
              )
            : ""
        }
      />

      <ModulePicker
        selected={selected}
        onChange={
          setSelected
        }
      />

      <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
        Save course
      </button>

      {item && (
        <EntityLifecycleActions
          item={item}
          entityLabel="Course"
          onRun={onRun}
          deactivate={() =>
            userManagement.deactivateCourse(
              item.id
            )
          }
          reactivate={() =>
            userManagement.reactivateCourse(
              item.id
            )
          }
          permanentlyDelete={(confirmation) =>
            userManagement.permanentlyDeleteCourse(
              item.id,
              confirmation
            )
          }
        />
      )}
    </form>
  );
}

function BatchForm({
  item,
  organizations,
  courses,
  users,
  onRun,
}: {
  item: Entity | null;
  organizations: Entity[];
  courses: Entity[];
  users: ManagedUser[];

  onRun: (
    action: () => Promise<unknown>,
    message: string
  ) => Promise<void>;
}) {
  const [
    selected,
    setSelected,
  ] = useState<string[]>(
    Array.isArray(
      item?.allowed_modules
    )
      ? (item?.allowed_modules as string[])
      : []
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const form =
          new FormData(
            event.currentTarget
          );

        const payload = {
          name:
            form.get("name"),

          organization_id:
            form.get(
              "organization_id"
            ),

          course_id:
            form.get(
              "course_id"
            ),

          start_at:
            form.get(
              "start_at"
            ),

          end_at:
            form.get(
              "end_at"
            ),

          access_end_at:
            form.get(
              "access_end_at"
            ),

          trainer_ids:
            form.getAll(
              "trainer_ids"
            ),

          max_students:
            Number(
              form.get(
                "max_students"
              )
            ),

          allowed_modules:
            selected,

          is_active: item
            ? entityIsActive(item)
            : true,
        };

        void onRun(
          () =>
            item
              ? userManagement.updateBatch(
                  item.id,
                  payload
                )
              : userManagement.createBatch(
                  payload
                ),
          "Batch saved."
        );
      }}
      className="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          name="name"
          label="Batch name"
          required
          defaultValue={
            item
              ? value(
                  item,
                  "name"
                )
              : ""
          }
        />

        <Select
          name="organization_id"
          label="Organization"
          required
          defaultValue={
            item
              ? value(
                  item,
                  "organization_id"
                )
              : ""
          }
        >
          <option value="">
            Select
          </option>

          {organizations.map(
            (row) => (
              <option
                key={row.id}
                value={row.id}
              >
                {value(
                  row,
                  "name"
                )}
              </option>
            )
          )}
        </Select>

        <Select
          name="course_id"
          label="Course"
          required
          defaultValue={
            item
              ? value(
                  item,
                  "course_id"
                )
              : ""
          }
        >
          <option value="">
            Select
          </option>

          {courses.map(
            (row) => (
              <option
                key={row.id}
                value={row.id}
              >
                {value(
                  row,
                  "name"
                )}
              </option>
            )
          )}
        </Select>

        <label className="grid gap-1 text-xs font-medium text-slate-400">
          Trainers

          <select
            name="trainer_ids"
            multiple
            defaultValue={
              Array.isArray(
                item?.trainer_ids
              )
                ? (item?.trainer_ids as string[])
                : []
            }
            className="min-h-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            {users
              .filter(
                (row) =>
                  row.role ===
                  "trainer"
              )
              .map(
                (row) => (
                  <option
                    key={
                      row.id
                    }
                    value={
                      row.id
                    }
                  >
                    {row.full_name ||
                      row.email}
                  </option>
                )
              )}
          </select>
        </label>

        <Field
          name="start_at"
          label="Start"
          type="datetime-local"
          required
        />

        <Field
          name="end_at"
          label="End"
          type="datetime-local"
          required
        />

        <Field
          name="access_end_at"
          label="Access expiry"
          type="datetime-local"
          required
        />

        <Field
          name="max_students"
          label="Max students"
          type="number"
          required
          defaultValue={
            item
              ? value(
                  item,
                  "max_students"
                )
              : 30
          }
        />
      </div>

      <ModulePicker
        selected={selected}
        onChange={
          setSelected
        }
      />

      <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
        Save batch
      </button>

      {item && (
        <EntityLifecycleActions
          item={item}
          entityLabel="Batch"
          deactivateLabel="Close / Deactivate"
          onRun={onRun}
          deactivate={() =>
            userManagement.deactivateBatch(
              item.id
            )
          }
          reactivate={() =>
            userManagement.reactivateBatch(
              item.id
            )
          }
          permanentlyDelete={(confirmation) =>
            userManagement.permanentlyDeleteBatch(
              item.id,
              confirmation
            )
          }
        />
      )}
    </form>
  );
}
