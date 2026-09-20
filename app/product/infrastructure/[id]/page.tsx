"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DisplayMedium, Eyebrow } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surface";
import { DocumentEditor } from "@/components/product/DocumentEditor";
import { documentStore } from "@/lib/store/document-store";
import type { Document } from "@/lib/types/graph";

export default function InfrastructureDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | undefined>();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const found = documentStore.getDocument(params.id as string);
    setDoc(found);
  }, [params.id]);

  const handleUpdate = (title: string, content: string) => {
    documentStore.updateDocument(params.id as string, { title, content });
    setDoc(documentStore.getDocument(params.id as string));
    setEditing(false);
  };

  const handleDelete = () => {
    documentStore.deleteDocument(params.id as string);
    router.push("/product/infrastructure");
  };

  if (!doc) {
    return (
      <div className="px-6 py-96">
        <div className="max-w-4xl mx-auto">
          <p className="text-mist">Document not found.</p>
          <Link href="/product/infrastructure" className="text-acid-lime text-body-sm mt-2 inline-block">
            ← Back to Infrastructure
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-96">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/product/infrastructure" className="text-body-sm text-fog hover:text-paper transition-colors">
            ← Infrastructure
          </Link>
        </div>

        <Eyebrow className="text-fog mb-2">Infrastructure / Document</Eyebrow>

        {editing ? (
          <DocumentEditor
            initialTitle={doc.title}
            initialContent={doc.content}
            onSave={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div className="flex items-start justify-between mb-6">
              <DisplayMedium className="text-paper">{doc.title}</DisplayMedium>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>

            <Card level={1}>
              <pre className="text-body-sm text-mist whitespace-pre-wrap font-sans leading-relaxed">
                {doc.content}
              </pre>
            </Card>

            <p className="text-xs text-ash mt-4">
              Last updated: {new Date(doc.updatedAt).toLocaleString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
