import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
    Stethoscope,
    User,
    ShieldCheck,
    Loader2,
    RefreshCw,
    ChevronDown,
    Search,
    Users as UsersIcon,
    X,
    SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardContainer } from "@/components/layout/DashboardContainer";
import { SectionHeader } from "@/components/ui/section-header";

const BASE_URL = import.meta.env.VITE_INFER_BASE_URL || "http://localhost:8000";

type Role = "doctor" | "patient" | "admin";
type RoleFilter = Role | "all";

interface ClerkUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    role: Role;
    createdAt: number;
}

const ROLE_CONFIG: Record<Role, {
    label: string;
    icon: React.ReactNode;
    badge: string;
    ring: string;
    accent: string;
}> = {
    admin: {
        label: "Admin",
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        ring: "ring-purple-200",
        accent: "text-purple-600 bg-purple-50 border-purple-200",
    },
    doctor: {
        label: "Doctor",
        icon: <Stethoscope className="w-3.5 h-3.5" />,
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        ring: "ring-blue-200",
        accent: "text-blue-600 bg-blue-50 border-blue-200",
    },
    patient: {
        label: "Patient",
        icon: <User className="w-3.5 h-3.5" />,
        badge: "bg-primary/5 text-primary border-primary/20",
        ring: "ring-primary/20",
        accent: "text-primary bg-primary/5 border-primary/20",
    },
};

const formatJoinDate = (ts: number) => {
    if (!ts) return "—";
    const d = new Date(ts);
    const now = Date.now();
    const diffDays = Math.floor((now - ts) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function Admin() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [users, setUsers] = useState<ClerkUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

    const currentRole = user?.publicMetadata?.role as Role | undefined;

    // Redirect non-admins
    useEffect(() => {
        if (user && currentRole !== "admin") {
            navigate("/");
        }
    }, [user, currentRole, navigate]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(`${body.reason || "unknown"}`);
            }
            setUsers(await res.json());
        } catch (err) {
            console.error('[admin] fetchUsers error:', err);
            toast({ title: "Error", description: "Could not load users.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [getToken, toast]);

    useEffect(() => {
        if (currentRole === "admin") fetchUsers();
    }, [currentRole, fetchUsers]);

    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return users.filter((u) => {
            const matchesRole = roleFilter === "all" || u.role === roleFilter;
            const matchesSearch =
                !q ||
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q);
            return matchesRole && matchesSearch;
        });
    }, [users, searchQuery, roleFilter]);

    const setRole = async (userId: string, role: Role) => {
        setUpdatingId(userId);
        try {
            const token = await getToken();
            const res = await fetch(`${BASE_URL}/admin/set-role`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role }),
            });
            if (!res.ok) throw new Error("Failed to update role");
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
            toast({ title: "Role updated", description: `User is now a ${ROLE_CONFIG[role].label}.` });
        } catch {
            toast({ title: "Error", description: "Could not update role.", variant: "destructive" });
        } finally {
            setUpdatingId(null);
        }
    };

    // Auth gates
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <ShieldCheck className="w-10 h-10 text-primary/30 mx-auto" />
                    <p className="text-sm font-semibold text-foreground/50">Please sign in to access this page.</p>
                </div>
            </div>
        );
    }

    if (currentRole !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <ShieldCheck className="w-10 h-10 text-rose-400 mx-auto" />
                    <p className="text-sm font-semibold text-foreground/60">You don't have permission to view this page.</p>
                    <p className="text-xs text-foreground/40">Admin access required.</p>
                </div>
            </div>
        );
    }

    const roleCounts = (["admin", "doctor", "patient"] as Role[]).map((r) => ({
        role: r,
        count: users.filter((u) => u.role === r).length,
        cfg: ROLE_CONFIG[r],
    }));
    const totalUsers = users.length;

    const filterTabs: { key: RoleFilter; label: string; count: number }[] = [
        { key: "all", label: "All", count: totalUsers },
        { key: "admin", label: "Admins", count: roleCounts[0].count },
        { key: "doctor", label: "Doctors", count: roleCounts[1].count },
        { key: "patient", label: "Patients", count: roleCounts[2].count },
    ];

    return (
        <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-8 w-full max-w-[100vw] overflow-x-hidden relative">

            {/* Hero Header */}
            <section className="mx-2 mt-4 relative overflow-hidden">
                <div className="relative px-6 py-12 lg:p-16 rounded-[24px] bg-primary border border-white/10 flex flex-col justify-center overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-40" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-40" />
                    <div className="relative z-10 max-w-6xl mx-auto text-center space-y-4">
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1]">
                            Admin
                        </h1>
                        <p className="text-base md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
                            Manage user roles and access permissions across the platform.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Row — Total + Role breakdown */}
            <section className="mx-2">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Users card */}
                    <DashboardContainer className="bg-white/90 px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 text-primary">
                                <UsersIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                                <p className="text-[11px] text-foreground/50 font-semibold uppercase tracking-widest">Total Users</p>
                            </div>
                        </div>
                    </DashboardContainer>

                    {/* Role count cards */}
                    {roleCounts.map(({ role, count, cfg }) => {
                        const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                        return (
                            <DashboardContainer key={role} className="bg-white/90 px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl border text-sm ${cfg.badge}`}>
                                        {cfg.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-bold text-foreground">{count}</p>
                                            <span className="text-[11px] text-foreground/40 font-semibold">{pct}%</span>
                                        </div>
                                        <p className="text-[11px] text-foreground/50 font-semibold uppercase tracking-widest">{cfg.label}s</p>
                                    </div>
                                </div>
                            </DashboardContainer>
                        );
                    })}
                </div>
            </section>

            {/* User Table */}
            <section className="mx-2">
                <DashboardContainer className="bg-white/90 p-6 lg:p-8">
                    <SectionHeader
                        icon={ShieldCheck}
                        title="User Management"
                        subtitle="Role control"
                        rightElement={
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchUsers}
                                disabled={loading}
                                className="rounded-full px-4 h-9 text-[9px] font-medium tracking-widest border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white shadow-sm gap-2"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                                REFRESH
                            </Button>
                        }
                    />

                    {/* Search + Filter toolbar */}
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-5">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-primary/15 bg-white/70 placeholder:text-foreground/40 focus:outline-none focus:border-primary/40 focus:bg-white transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Role filter tabs */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-primary/5 border border-primary/10 overflow-x-auto">
                            {filterTabs.map((tab) => {
                                const isActive = roleFilter === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setRoleFilter(tab.key)}
                                        className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${isActive ? "text-white" : "text-foreground/60 hover:text-primary"
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="admin-filter-pill"
                                                className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative flex items-center gap-1.5">
                                            {tab.label}
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20" : "bg-foreground/5"
                                                }`}>
                                                {tab.count}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        /* Empty state (no results) */
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                                <SearchX className="w-6 h-6 text-primary/40" />
                            </div>
                            <p className="text-sm font-semibold text-foreground/70">No users found</p>
                            <p className="text-xs text-foreground/40 mt-1">
                                {searchQuery || roleFilter !== "all"
                                    ? "Try adjusting your search or filter."
                                    : "There are no users in the system yet."}
                            </p>
                            {(searchQuery || roleFilter !== "all") && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setSearchQuery(""); setRoleFilter("all"); }}
                                    className="mt-4 text-xs text-primary"
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white/40 rounded-[16px] border border-white shadow-inner-sm overflow-hidden">
                            {/* Column header */}
                            <div className="hidden md:grid grid-cols-[1fr_120px_100px_140px] items-center gap-4 px-5 py-3 bg-primary/[0.03] border-b border-primary/5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">User</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Role</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Joined</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 text-right">Change Role</p>
                            </div>

                            <div className="divide-y divide-primary/5">
                                <AnimatePresence initial={false}>
                                    {filteredUsers.map((u, i) => {
                                        const cfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.patient;
                                        const isUpdating = updatingId === u.id;
                                        const isSelf = u.id === user.id;

                                        return (
                                            <motion.div
                                                key={u.id}
                                                layout
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                                className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_140px] items-center gap-3 md:gap-4 px-5 py-4 hover:bg-primary/[0.02] transition-colors group"
                                            >
                                                {/* User (avatar + name/email) */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={u.imageUrl}
                                                            alt={u.firstName}
                                                            className={`w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover ring-2 ${cfg.ring} transition-all group-hover:scale-105`}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-foreground truncate">
                                                            {u.firstName} {u.lastName}
                                                            {isSelf && (
                                                                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                                                                    you
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-foreground/40 truncate">{u.email}</p>
                                                    </div>
                                                </div>

                                                {/* Current role badge */}
                                                <div className="md:justify-self-start">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                                                        {cfg.icon} {cfg.label}
                                                    </div>
                                                </div>

                                                {/* Joined */}
                                                <div className="md:justify-self-start">
                                                    <span className="text-xs text-foreground/50 font-medium">
                                                        {formatJoinDate(u.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Role selector */}
                                                <div className="md:justify-self-end">
                                                    {isSelf ? (
                                                        <span className="text-xs text-foreground/30 italic">cannot edit self</span>
                                                    ) : (
                                                        <div className="relative">
                                                            <select
                                                                value={u.role}
                                                                disabled={isUpdating}
                                                                onChange={(e) => setRole(u.id, e.target.value as Role)}
                                                                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-primary/20 bg-white/80 text-foreground focus:outline-none focus:border-primary/40 cursor-pointer disabled:opacity-50 hover:border-primary/40 hover:bg-white transition-all w-full"
                                                            >
                                                                <option value="patient">Patient</option>
                                                                <option value="doctor">Doctor</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                            {isUpdating
                                                                ? <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-primary/50 pointer-events-none" />
                                                                : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Footer: result count + notice */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
                        <p className="text-[11px] text-foreground/40 font-medium">
                            {!loading && (
                                <>
                                    Showing <span className="font-bold text-foreground/60">{filteredUsers.length}</span>
                                    {" "}of <span className="font-bold text-foreground/60">{totalUsers}</span> user{totalUsers !== 1 ? "s" : ""}
                                </>
                            )}
                        </p>
                        <p className="text-center text-[11px] text-foreground/30 font-medium uppercase tracking-wider">
                            Users must sign out and back in to see role updates.
                        </p>
                    </div>
                </DashboardContainer>
            </section>
        </div>
    );
}
