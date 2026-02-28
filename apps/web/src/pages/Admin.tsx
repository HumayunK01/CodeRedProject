import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Stethoscope, User, ShieldCheck, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { DashboardContainer } from "@/components/layout/DashboardContainer";
import { SectionHeader } from "@/components/ui/section-header";

const BASE_URL = import.meta.env.VITE_INFER_BASE_URL || "http://localhost:8000";

type Role = "doctor" | "patient" | "admin";

interface ClerkUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    role: Role;
    createdAt: number;
}

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ReactNode; badge: string }> = {
    admin: { label: "Admin", icon: <ShieldCheck className="w-3.5 h-3.5" />, badge: "bg-purple-50 text-purple-700 border-purple-200" },
    doctor: { label: "Doctor", icon: <Stethoscope className="w-3.5 h-3.5" />, badge: "bg-blue-50 text-blue-700 border-blue-200" },
    patient: { label: "Patient", icon: <User className="w-3.5 h-3.5" />, badge: "bg-primary/5 text-primary border-primary/20" },
};

export default function Admin() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [users, setUsers] = useState<ClerkUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const currentRole = user?.publicMetadata?.role as Role | undefined;

    // Redirect non-admins
    useEffect(() => {
        if (user && currentRole !== "admin") {
            navigate("/");
        }
    }, [user, currentRole, navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            console.log('[admin] token prefix:', token ? token.substring(0, 30) + '...' : 'NULL');
            const res = await fetch(`${BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error('[admin] error response:', body);
                throw new Error(`${body.reason || "unknown"}`);
            }
            setUsers(await res.json());
        } catch (err) {
            console.error('[admin] fetchUsers error:', err);
            toast({ title: "Error", description: "Could not load users.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentRole === "admin") fetchUsers();
    }, [currentRole]);

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

    return (
        <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-8 w-full max-w-[100vw] overflow-x-hidden relative">

            {/* Hero Header — matches Dashboard/Diagnosis pattern */}
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

            {/* Stats Row */}
            <section className="mx-2">
                <div className="grid grid-cols-3 gap-4">
                    {roleCounts.map(({ role, count, cfg }) => (
                        <DashboardContainer key={role} className="bg-white/90 px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl border text-sm ${cfg.badge}`}>
                                    {cfg.icon}
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{count}</p>
                                    <p className="text-[11px] text-foreground/50 font-semibold uppercase tracking-widest">{cfg.label}s</p>
                                </div>
                            </div>
                        </DashboardContainer>
                    ))}
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

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                        </div>
                    ) : (
                        <div className="bg-white/40 rounded-[16px] border border-white shadow-inner-sm overflow-hidden divide-y divide-primary/5">
                            {users.map((u, i) => {
                                const cfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.patient;
                                const isUpdating = updatingId === u.id;
                                const isSelf = u.id === user.id;

                                return (
                                    <motion.div
                                        key={u.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="flex items-center gap-4 px-5 py-4"
                                    >
                                        {/* Avatar */}
                                        <img
                                            src={u.imageUrl}
                                            alt={u.firstName}
                                            className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover flex-shrink-0"
                                        />

                                        {/* Name + email */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {u.firstName} {u.lastName}
                                                {isSelf && <span className="ml-2 text-[10px] text-primary/50 font-normal">(you)</span>}
                                            </p>
                                            <p className="text-xs text-foreground/40 truncate">{u.email}</p>
                                        </div>

                                        {/* Current role badge */}
                                        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                                            {cfg.icon} {cfg.label}
                                        </div>

                                        {/* Role selector */}
                                        {isSelf ? (
                                            <span className="text-xs text-foreground/30 italic pr-1">cannot edit self</span>
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    value={u.role}
                                                    disabled={isUpdating}
                                                    onChange={(e) => setRole(u.id, e.target.value as Role)}
                                                    className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-primary/20 bg-white/80 text-foreground focus:outline-none focus:border-primary/40 cursor-pointer disabled:opacity-50 hover:border-primary/40 transition-colors"
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
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    <p className="text-center text-[11px] text-foreground/30 font-medium uppercase tracking-wider mt-4">
                        Role changes take effect immediately — users must sign out and back in to see updates.
                    </p>
                </DashboardContainer>
            </section>
        </div>
    );
}
