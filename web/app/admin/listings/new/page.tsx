"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminListingsNewPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/listings");
  }, [router]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      Yönlendiriliyor…
    </div>
  );
}
