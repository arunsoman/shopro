// SS5.2 — Weekly Prime Cost Worksheet page wrapper
import React, { type FC } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useAppStore } from "@/App";
import WeeklyWorksheet from "./components/primecost/WeeklyWorksheet";

const WeeklyWorksheetPage: FC = () => {
  const navigate     = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();

  return (
    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950">
      <WeeklyWorksheet
        restaurantId={restaurantId}
        onBack={() => navigate("prime-cost")}
      />
    </div>
  );
};

export default WeeklyWorksheetPage;
