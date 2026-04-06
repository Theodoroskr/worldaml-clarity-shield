import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Loader2, Plus, Save, Trash2, Play, Pause, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: string;
  nodes: any[];
  edges: any[];
  created_at: string;
}

const TRIGGER_TYPES = ["manual", "new_customer", "screening_match", "transaction_flagged", "risk_change"];
const NODE_TYPES_LIST = ["trigger", "action", "condition", "approval", "notification", "end"];
const ACTION_TYPES = ["assign_reviewer", "change_risk_level", "send_alert", "create_case", "request_edd", "send_email"];
const CONDITION_FIELDS = ["risk_level", "amount", "country", "kyc_status", "customer_type"];

const nodeColors: Record<string, string> = {
  trigger: "#3b82f6",
  action: "#10b981",
  condition: "#f59e0b",
  approval: "#8b5cf6",
  notification: "#ec4899",
  end: "#6b7280",
};

function CustomNode({ data, type }: { data: any; type: string }) {
  const color = nodeColors[data.nodeType] || "#6b7280";
  return (
    <div className="rounded-lg border-2 bg-white shadow-sm px-4 py-3 min-w-[160px]" style={{ borderColor: color }}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>{data.nodeType}</div>
      <div className="text-sm font-medium text-gray-900 mt-0.5">{data.label || "Untitled"}</div>
      {data.config && <div className="text-[10px] text-gray-500 mt-1">{JSON.stringify(data.config).slice(0, 60)}</div>}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

const customNodeTypes: NodeTypes = {
  custom: CustomNode as any,
};

export default function AdminWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTrigger, setEditTrigger] = useState("manual");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [newNodeType, setNewNodeType] = useState("action");
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const fetchWorkflows = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_workflows").select("*").order("created_at", { ascending: false });
    setWorkflows((data || []) as Workflow[]);
    setLoading(false);
  };

  useEffect(() => { fetchWorkflows(); }, []);

  const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge(params, eds)), [setEdges]);

  const openEditor = (wf?: Workflow) => {
    if (wf) {
      setEditingId(wf.id);
      setEditName(wf.name);
      setEditTrigger(wf.trigger_type);
      setNodes((wf.nodes || []) as Node[]);
      setEdges((wf.edges || []) as Edge[]);
    } else {
      setEditingId("new");
      setEditName("");
      setEditTrigger("manual");
      const startNode: Node = {
        id: "trigger-1",
        type: "custom",
        position: { x: 250, y: 50 },
        data: { label: "Start", nodeType: "trigger", config: {} },
      };
      setNodes([startNode]);
      setEdges([]);
    }
  };

  const addNode = () => {
    if (!newNodeLabel.trim()) { toast.error("Label required"); return; }
    const id = `${newNodeType}-${Date.now()}`;
    const newNode: Node = {
      id,
      type: "custom",
      position: { x: 250, y: (nodes.length + 1) * 120 },
      data: { label: newNodeLabel, nodeType: newNodeType, config: {} },
    };
    setNodes(nds => [...nds, newNode]);
    setNewNodeLabel("");
    setAddNodeOpen(false);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  const saveWorkflow = async () => {
    if (!editName.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const payload = {
      name: editName,
      trigger_type: editTrigger,
      nodes: nodes as any,
      edges: edges as any,
      created_by: user!.id,
    };
    if (editingId === "new") {
      const { error } = await supabase.from("admin_workflows").insert(payload);
      if (error) toast.error("Failed to create"); else toast.success("Workflow created");
    } else {
      const { error } = await supabase.from("admin_workflows").update(payload).eq("id", editingId!);
      if (error) toast.error("Failed to save"); else toast.success("Workflow saved");
    }
    setSaving(false);
    setEditingId(null);
    fetchWorkflows();
  };

  const toggleActive = async (wf: Workflow) => {
    await supabase.from("admin_workflows").update({ is_active: !wf.is_active }).eq("id", wf.id);
    fetchWorkflows();
  };

  const deleteWorkflow = async (id: string) => {
    await supabase.from("admin_workflows").delete().eq("id", id);
    toast.success("Workflow deleted");
    fetchWorkflows();
  };

  // List view
  if (!editingId) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-foreground">Workflows</h1><p className="text-xs text-muted-foreground">Visual drag-and-drop workflow builder</p></div>
          <Button size="sm" onClick={() => openEditor()}><Plus className="w-3.5 h-3.5 mr-1" /> New Workflow</Button>
        </div>

        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div> : (
          <div className="grid gap-3">
            {workflows.map(wf => (
              <div key={wf.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div>
                  <div className="font-medium text-foreground text-sm flex items-center gap-2">{wf.name} <Badge variant={wf.is_active ? "default" : "outline"} className="text-xs">{wf.is_active ? "Active" : "Draft"}</Badge></div>
                  <div className="text-xs text-muted-foreground mt-0.5">Trigger: {wf.trigger_type.replace(/_/g, " ")} · {(wf.nodes || []).length} nodes</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleActive(wf)}>{wf.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEditor(wf)}>Edit</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteWorkflow(wf.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
            {workflows.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">No workflows yet. Create one to automate compliance processes.</div>}
          </div>
        )}
      </div>
    );
  }

  // Editor view
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><ArrowLeft className="w-4 h-4" /></Button>
        <Input className="w-56 h-8 text-sm" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Workflow name" />
        <Select value={editTrigger} onValueChange={setEditTrigger}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{TRIGGER_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex-1" />
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setAddNodeOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Add Node</Button>
        {selectedNode && <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive" onClick={() => deleteNode(selectedNode.id)}><Trash2 className="w-3.5 h-3.5 mr-1" />Delete Node</Button>}
        <Button size="sm" className="h-8 text-xs" onClick={saveWorkflow} disabled={saving}>{saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}<Save className="w-3.5 h-3.5 mr-1" />Save</Button>
      </div>
      <div className="flex-1" style={{ minHeight: 500 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onPaneClick={() => setSelectedNode(null)}
          nodeTypes={customNodeTypes}
          fitView
          className="bg-muted/10"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      <Dialog open={addNodeOpen} onOpenChange={setAddNodeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Node</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={newNodeType} onValueChange={setNewNodeType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{NODE_TYPES_LIST.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={newNodeLabel} onChange={e => setNewNodeLabel(e.target.value)} placeholder="Node label" />
          </div>
          <DialogFooter><Button onClick={addNode}><Plus className="w-3.5 h-3.5 mr-1" />Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
