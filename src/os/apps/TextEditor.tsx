import { FileSystem, FileNode, getNode } from "@/os/state/fs";
import { getPath } from "@/os/state/fsUtils";
import { useEffect, useState } from "react";

export interface TextEditorProps {
  fs: FileSystem;
  fileId: string;
  onSave: (content: string) => void;
  onRename: (name: string) => void;
}

const TextEditor = ({ fs, fileId, onSave, onRename }: TextEditorProps) => {
  const node = getNode(fs, fileId) as FileNode;
  const [text, setText] = useState(node?.content || "");
  const [name, setName] = useState(node?.name || "");

  useEffect(() => {
    setText(node?.content || "");
    setName(node?.name || "");
  }, [fileId]);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="text-xs text-muted-foreground">Path: {getPath(fs, fileId)}</div>
      <div className="flex items-center gap-2">
        <input
          className="px-2 py-1 border rounded-md bg-background text-sm flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="px-3 py-1 rounded-md bg-secondary border text-sm"
          onClick={() => onRename(name)}
        >
          Rename
        </button>
      </div>
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
