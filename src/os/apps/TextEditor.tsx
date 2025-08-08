import { FileSystem, FileNode, getNode } from "@/os/state/fs";
import { useEffect, useState } from "react";

export interface TextEditorProps {
  fs: FileSystem;
  fileId: string;
  onSave: (content: string) => void;
}

const TextEditor = ({ fs, fileId, onSave }: TextEditorProps) => {
  const node = getNode(fs, fileId) as FileNode;
  const [text, setText] = useState(node?.content || "");

  useEffect(() => {
    setText(node?.content || "");
  }, [fileId]);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="text-sm text-muted-foreground">Editing: {node?.name}</div>
      <textarea
        className="flex-1 w-full border rounded-lg p-3 bg-background"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something heart‑melting…"
      />
      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground" onClick={() => onSave(text)}>Save</button>
      </div>
    </div>
  );
};

export default TextEditor;
