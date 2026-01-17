import React from "react";

// icons
import { Loader2 } from "lucide-react";

export const PageLoader: React.FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  );
};
