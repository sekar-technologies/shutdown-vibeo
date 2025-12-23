import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  try {
    console.log("IP Check API called");
    const headerList = await headers();
    
    const ipAddress =
      headerList.get("x-forwarded-for")?.split(",")[0] ||
      headerList.get("x-real-ip") ||
      "";

    if (!ipAddress || ipAddress === "::1" || ipAddress === "127.0.0.1") {
      // For local testing: return s: true to trigger redirect
      return NextResponse.json({ success: true, s: true });
    }

    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,continentCode,country,proxy`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const data = await response.json();

    // Server-side logging as requested
    console.log(`[IP Check] IP: ${ipAddress}, Country: ${data.country}, Continent: ${data.continentCode}, Proxy: ${data.proxy}`);

    // If continent is Asia (AS) OR it's a proxy, return s: false (Shutdown UI)
    if (data.status === "success" && (data.continentCode === "AS" || data.proxy === true)) {
      return NextResponse.json({ success: true, s: false });
    }

    // Otherwise return s: true (Redirect)
    return NextResponse.json({ success: true, s: true });
    
  } catch (error) {
    console.error("IP validation error:", error);
    // Fallback to s: true on error
    return NextResponse.json({ success: true, s: true });
  }
}
