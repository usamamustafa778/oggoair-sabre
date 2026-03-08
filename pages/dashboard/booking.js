import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Booking() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to passenger-details page
    router.replace("/dashboard/passenger-details");
  }, [router]);

  return null;
}
