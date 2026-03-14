import { useState, useEffect } from "react";
import { tablesideApi, type TablesideSessionDto } from "../../settings/api/tablesideApi";
import { tablesApi } from "../api/floorApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, User, Loader2, AlertCircle } from "lucide-react";

export function TablesideSessionManagement() {
    const [pendingSessions, setPendingSessions] = useState<TablesideSessionDto[]>([]);
    const [tableNames, setTableNames] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [sessions, tables] = await Promise.all([
                tablesideApi.getPendingSessions(),
                tablesApi.getAll()
            ]);
            
            setPendingSessions(sessions);
            
            const nameMap: Record<string, string> = {};
            tables.forEach(t => {
                nameMap[t.id] = t.name;
            });
            setTableNames(nameMap);
        } catch (error) {
            console.error("Failed to load tableside sessions", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (sessionId: string) => {
        try {
            await tablesideApi.approveSession(sessionId);
            setPendingSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (error) {
            console.error("Approval Failed", error);
        }
    };

    const handleReject = async (sessionId: string) => {
        try {
            await tablesideApi.rejectSession(sessionId);
            setPendingSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (error) {
            console.error("Rejection Failed", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Tableside Requests</CardTitle>
                        <CardDescription>Guests waiting for tableside access</CardDescription>
                    </div>
                    {pendingSessions.length > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                            {pendingSessions.length} Pending
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {pendingSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
                        <User className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                        <p className="text-sm text-muted-foreground">No pending requests</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingSessions.map((session) => (
                            <div 
                                key={session.id} 
                                className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <AlertCircle className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Table {tableNames[session.tableId] || session.tableId}</div>
                                        <div className="text-xs text-muted-foreground">New Guest Scanned</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive hover:text-white"
                                        onClick={() => handleReject(session.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprove(session.id)}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
