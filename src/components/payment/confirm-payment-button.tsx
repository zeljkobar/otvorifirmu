"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ConfirmPaymentButtonProps {
  requestId: number;
}

export function ConfirmPaymentButton({ requestId }: ConfirmPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirmPayment = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/company-request/${requestId}/confirm-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Preusmeri na request stranicu
        router.push(`/request/${requestId}`);
      } else {
        console.error("Failed to confirm payment");
        alert("Greška prilikom potvrde plaćanja. Pokušajte ponovo.");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Greška prilikom potvrde plaćanja. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConfirmPayment}
      disabled={loading}
      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Potvrđujem..." : "Potvrdim da sam platio"}
    </button>
  );
}
