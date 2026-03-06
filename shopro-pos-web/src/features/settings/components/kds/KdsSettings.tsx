import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KdsStationSettings } from "./KdsStationSettings";
import { KdsRoutingSettings } from "./KdsRoutingSettings";
import { Monitor, GitBranch } from "lucide-react";

export default function KdsSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <Monitor className="w-8 h-8 text-primary" />
                    Kitchen Display (KDS)
                </h1>
                <p className="text-muted mt-1">
                    Configure kitchen screens and define how orders are routed to them.
                </p>
            </div>

            <Tabs defaultValue="stations" className="w-full">
                <TabsList className="bg-surface border border-border p-1 mb-6">
                    <TabsTrigger
                        value="stations"
                        className="data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted px-6"
                    >
                        <Monitor className="w-4 h-4 mr-2" />
                        Stations
                    </TabsTrigger>
                    <TabsTrigger
                        value="routing"
                        className="data-[state=active]:bg-muted/20 data-[state=active]:text-foreground text-muted px-6"
                    >
                        <GitBranch className="w-4 h-4 mr-2" />
                        Routing Rules
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="stations" className="mt-0 outline-none">
                    <KdsStationSettings />
                </TabsContent>

                <TabsContent value="routing" className="mt-0 outline-none">
                    <KdsRoutingSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
