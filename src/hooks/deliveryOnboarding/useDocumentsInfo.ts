
import { useState } from "react";
import { DeliveryDocument } from "@/types/delivery";

export function useDocumentsInfo(initial?: DeliveryDocument[]) {
  const [documents, setDocuments] = useState<DeliveryDocument[]>(initial || []);

  function addDocument(document: DeliveryDocument) {
    setDocuments((prev) => [...prev, document]);
  }

  function setAllDocuments(docs: DeliveryDocument[]) {
    setDocuments(docs);
  }

  return {
    documents,
    addDocument,
    setAllDocuments,
  };
}
