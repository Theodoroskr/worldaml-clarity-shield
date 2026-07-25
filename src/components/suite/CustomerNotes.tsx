import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, AtSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MentionTextarea, renderMentionText, type MentionCandidate } from "@/components/suite/MentionTextarea";

type Note = {
  id: string; content: string; user_id: string; created_at: string;
  mentions: string[] | null;
};

type Props = {
  customerId: string;
  organisationId: string;
  userId: string;
  members: MentionCandidate[];
  memberLabel: (uid: string | null) => string;
};

export function CustomerNotes({ customerId, organisationId, userId, members, memberLabel }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [value, setValue] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("suite_customer_notes")
      .select("id,content,user_id,created_at,mentions")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: true });
    if (error) return toast.error(error.message);
    setNotes((data || []) as Note[]);
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  async function post() {
    if (!value.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("suite_customer_notes").insert({
      customer_id: customerId,
      organisation_id: organisationId,
      user_id: userId,
      content: value.trim(),
      mentions,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setValue(""); setMentions([]);
    toast.success(mentions.length ? `Comment added · ${mentions.length} notified` : "Comment added");
    load();
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />Customer comments ({notes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {notes.map(n => (
            <div key={n.id} className="border rounded p-2 text-sm">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                <span>{memberLabel(n.user_id)} · {formatDistanceToNow(new Date(n.created_at))} ago</span>
                {n.mentions && n.mentions.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <AtSign className="h-3 w-3" />{n.mentions.length}
                  </span>
                )}
              </div>
              <div className="whitespace-pre-wrap">{renderMentionText(n.content)}</div>
            </div>
          ))}
          {notes.length === 0 && <div className="text-xs text-muted-foreground">No customer comments yet.</div>}
        </div>
        <MentionTextarea
          value={value}
          onChange={(v, m) => { setValue(v); setMentions(m); }}
          members={members}
          placeholder="Comment on this customer — type @ to mention…"
          rows={2}
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {mentions.length > 0
              ? <span className="inline-flex items-center gap-1"><AtSign className="h-3 w-3" />{mentions.length} teammate{mentions.length === 1 ? "" : "s"} will be notified</span>
              : "Visible to your organisation"}
          </div>
          <Button size="sm" onClick={post} disabled={!value.trim() || busy}>Post</Button>
        </div>
      </CardContent>
    </Card>
  );
}
