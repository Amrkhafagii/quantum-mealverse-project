
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

const checkBrowser = () => {
  const u = navigator.userAgent;
  if (/Chrome/i.test(u) && !/Edge|OPR/.test(u)) return "Chrome";
  if (/Safari/i.test(u) && !/Chrome/.test(u)) return "Safari";
  if (/Firefox/i.test(u)) return "Firefox";
  if (/Edg/i.test(u)) return "Edge";
  return null;
};

interface LocationPermissionHelpProps {
  error?: string | null;
}

export const LocationPermissionHelp: React.FC<LocationPermissionHelpProps> = ({ error }) => {
  const browser = checkBrowser();

  const helpByBrowser: Record<string, React.ReactNode> = {
    Chrome: (
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Click the <span className="font-bold">lock</span> icon in the address bar.</li>
        <li>Change <span className="font-bold">Location</span> to <span className="font-bold">Allow</span>.</li>
        <li>Refresh the page and try again.</li>
        <li>If it still doesn't work, try clearing site settings: <br />
          <span className="text-xs">Settings &gt; Privacy and security &gt; Site Settings &gt; Location</span>
        </li>
      </ul>
    ),
    Safari: (
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Go to <span className="font-bold">Safari &gt; Preferences &gt; Websites &gt; Location</span>.</li>
        <li>Find this site and set it to <span className="font-bold">Allow</span>.</li>
        <li>Refresh the page and try again.</li>
        <li>If prompted, click <span className="font-bold">Allow</span> again.</li>
      </ul>
    ),
    Firefox: (
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Click the <span className="font-bold">location</span> icon in the address bar.</li>
        <li>Change permission to <span className="font-bold">Allow</span>.</li>
        <li>Reload the page and retry.</li>
        <li>If needed, open <span className="font-bold">Settings &gt; Privacy &amp; Security &gt; Permissions &gt; Location</span>.</li>
      </ul>
    ),
    Edge: (
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Click the <span className="font-bold">lock</span> icon left of the address bar.</li>
        <li>Change <span className="font-bold">Location</span> to <span className="font-bold">Allow</span>.</li>
        <li>Refresh and try again.</li>
        <li>For more: <span className="text-xs">Settings &gt; Cookies and site permissions &gt; Location</span></li>
      </ul>
    )
  };

  return (
    <Alert className="border-orange-400 bg-orange-50 mt-4">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription>
        <div className="font-medium mb-1 text-orange-900">
          {error
            ? <>Location access denied. To proceed, please enable location in your browser settings or manually enter your address.</>
            : <>Having trouble with location permissions?</>
          }
        </div>
        {browser ? (
          <>{helpByBrowser[browser]}</>
        ) : (
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Look for a lock or location icon in your browser's address bar.</li>
            <li>Set location permission to <b>Allow</b> and refresh the page.</li>
            <li>If issues continue, try using Incognito/Private mode or another browser.</li>
          </ul>
        )}
        <div className="pt-2 text-xs text-orange-700">
          Still stuck? Try clearing site data or using a different device.<br/>
          You can also manually enter your address below to proceed.
        </div>
      </AlertDescription>
    </Alert>
  );
};

