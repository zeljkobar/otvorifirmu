"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";

interface GenerateDocumentsButtonProps {
  requestId: number;
  hasDocuments: boolean;
  canGenerate: boolean;
}

export function GenerateDocumentsButton({
  requestId,
  hasDocuments,
  canGenerate,
}: GenerateDocumentsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/company-request/${requestId}/generate-documents`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate documents");
      }

      // Refresh stranicu da prikaže nove dokumente
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!canGenerate) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        ⚠️ Dokumenti će biti dostupni nakon što plaćanje bude odobreno.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasDocuments && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-3">
          ℹ️ Dokumenti su već generisani. Možete ih regenerisati ako je potrebno.
        </div>
      )}
      
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generišem dokumente...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            {hasDocuments ? "Regeneriši dokumente" : "Generiši statut i dokumenta"}
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <strong>Greška:</strong> {error}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Dokument će biti automatski generisan na osnovu unesenih podataka
      </p>
    </div>
  );
}
