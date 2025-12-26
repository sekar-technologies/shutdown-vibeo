import { NextResponse } from "next/server";
import { headers } from "next/headers";

interface VPNAPIResponse {
  ip?: string;
  security?: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
  };
  location?: {
    city: string;
    region: string;
    country: string;
    continent: string;
    region_code: string;
    country_code: string;
    continent_code: string;
    latitude: string;
    longitude: string;
    time_zone: string;
    locale_code: string;
    metro_code: string;
    is_in_european_union: boolean;
  };
}

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

    // --- STEP 1: Check with ip-api.com ---
    const ipApiResponse = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,continentCode,country,proxy`
    );

    if (!ipApiResponse.ok) {
      console.error("ip-api.com failed");
    } else {
      const ipApiData = await ipApiResponse.json();
      console.log(`[ip-api.com] IP: ${ipAddress}, Country: ${ipApiData.country}, Continent: ${ipApiData.continentCode}, Proxy: ${ipApiData.proxy}`);

      // If continent is Asia (AS) OR it's a proxy according to ip-api, block immediately
      if (
        ipApiData.status === "success" &&
        (ipApiData.continentCode === "AS" || ipApiData.proxy === true)
      ) {
        return NextResponse.json({ success: true, s: false });
      }
    }

    // --- STEP 2: Secondary check with vpnapi.io if Step 1 passed ---
    const vpnApiKey = process.env.VPNAPI_KEY;
    if (vpnApiKey) {
      try {
        const vpnApiResponse = await fetch(
          `https://vpnapi.io/api/${ipAddress}?key=${vpnApiKey}`
        );

        if (vpnApiResponse.ok) {
          const vpnData: VPNAPIResponse = await vpnApiResponse.json();
          console.log("[vpnapi.io] Data: ", vpnData);

          const isSecurityRisk =
            vpnData.security?.vpn ||
            vpnData.security?.proxy ||
            vpnData.security?.tor ||
            vpnData.security?.relay;

          if (isSecurityRisk) {
            console.log(`[vpnapi.io] Security risk detected for IP: ${ipAddress}`);
            return NextResponse.json({ success: true, s: false });
          }
        }
      } catch (vpnError) {
        console.error("vpnapi.io check failed: ", vpnError);
      }
    } else {
      console.warn("VPNAPI_KEY is not set. Skipping secondary VPN check.");
    }

    // If both checks pass (or secondary is skipped), allow the user
    return NextResponse.json({ success: true, s: true });
  } catch (error) {
    console.error("IP validation error:", error);
    // Fallback to allow on error
    return NextResponse.json({ success: true, s: true });
  }
}
