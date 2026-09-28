"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SatelliteRegistryView } from "../../components/screens/SatelliteRegistryView";

export default function SatelliteRegistryPage() {
  const router = useRouter();

  const handleSelectSensor = (sensorId: string) => {
    router.push(`/analysis/new?sensor=${sensorId}`);
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <SatelliteRegistryView onSelectSensor={handleSelectSensor} />
      </div>
    </div>
  );
}
