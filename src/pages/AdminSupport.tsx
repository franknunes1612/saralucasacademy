import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Clock, Mail, User, RefreshCw, Trash2, Eye, X, CheckCircle, AlertCircle, HelpCircle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SupportMessage {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: typeof MessageCircle }> = {
  app_issues: { label: "App Issues", icon: AlertCircle },
  courses: { label: "Courses / Academy", icon: HelpCircle },
  payments: { label: "Payments", icon: Package },
  other: { label: "Other", icon: MessageCircle },
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-yellow-500/20 text-yellow-400",
  resolved: "bg-green-500/20 text-green-400",
  closed: "bg-gray-500/20 text-gray-400",
};

export default function AdminSupport() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching support messages:", error);
      toast.error("Failed to load support messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openMessage = (message: SupportMessage) => {
    setSelectedMessage(message);
    setAdminNotes(message.admin_notes || "");
    setSelectedStatus(message.status);
  };

  const handleSave = async () => {
    if (!selectedMessage) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("support_messages")
        .update({
          status: selectedStatus,
          admin_notes: adminNotes.trim() || null,
        })
        .eq("id", selectedMessage.id);

      if (error) throw error;

      toast.success("Message updated");
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this support message?")) return;

    try {
      const { error } = await supabase.from("support_messages").delete().eq("id", id);

      if (error) throw error;

      toast.success("Message deleted");
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORY_LABELS[category] || CATEGORY_LABELS.other;
  };

  const newMessagesCount = messages.filter((m) => m.status === "new").length;

  return (
    <div className="min-h-screen bg-background p-4 pt-5 pb-8 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Support Messages</h1>
            <p className="text-xs text-white/60">
              {messages.length} messages • {newMessagesCount} new
            </p>
          </div>
        </div>
        <button
          onClick={fetchMessages}
          disabled={isLoading}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          <RefreshCw className={`h-5 w-5 text-white ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Messages List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="result-card p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="result-card p-8 text-center">
          <MessageCircle className="h-12 w-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/60">No support messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const categoryInfo = getCategoryInfo(message.category);
            const CategoryIcon = categoryInfo.icon;
            return (
              <button
                key={message.id}
                onClick={() => openMessage(message)}
                className="result-card p-4 w-full text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <CategoryIcon className="h-4 w-4 text-white/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white truncate">{message.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[message.status] || STATUS_COLORS.new}`}>
                        {message.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 truncate">{message.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {message.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(message.created_at), "dd/MM HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="bg-background border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Support Message
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              {/* Sender Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="p-2 rounded-lg bg-primary/20">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white">{selectedMessage.name}</p>
                  <p className="text-sm text-white/60">{selectedMessage.email}</p>
                </div>
              </div>

              {/* Category & Date */}
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  {(() => {
                    const info = getCategoryInfo(selectedMessage.category);
                    const Icon = info.icon;
                    return (
                      <>
                        <Icon className="h-4 w-4" />
                        {info.label}
                      </>
                    );
                  })()}
                </span>
                <span>{format(new Date(selectedMessage.created_at), "dd MMM yyyy, HH:mm")}</span>
              </div>

              {/* Message */}
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-white whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="new" className="bg-background">New</option>
                  <option value="in_progress" className="bg-background">In Progress</option>
                  <option value="resolved" className="bg-background">Resolved</option>
                  <option value="closed" className="bg-background">Closed</option>
                </select>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes (not visible to user)..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="p-2.5 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Reply via Email Link */}
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: Sara Lucas Academy Support`}
                className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Reply via Email
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
