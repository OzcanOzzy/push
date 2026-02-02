"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditListingRedirect() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  useEffect(() => {
    // Yeni ilan sayfasına editId parametresi ile yönlendir
    router.replace(`/admin/listings/new?editId=${listingId}`);
  }, [listingId, router]);

  return (
    <main className="section">
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32 }}></i>
        <p style={{ marginTop: 16 }}>Yönlendiriliyor...</p>
      </div>
    </main>
  );
}
