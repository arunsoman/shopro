import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function TablesideSettingsPage() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [requireServer, setRequireServer] = useState(true);

    return (
        <div className="p-8 max-w-4xl space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tableside Ordering</h2>
                <p className="text-muted-foreground">Manage QR code and self-serve ordering configurations for your tables.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Global Configuration</CardTitle>
                    <CardDescription>Enable or disable tableside features for the entire restaurant.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base text-foreground">Enable Tableside Ordering</Label>
                            <p className="text-sm text-muted-foreground">Allow guests to scan QR codes to view the menu and order.</p>
                        </div>
                        <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base text-foreground">Require Server Approval</Label>
                            <p className="text-sm text-muted-foreground">Server must confirm the tableside carts before sending to kitchen.</p>
                        </div>
                        <Switch disabled={!isEnabled} checked={requireServer} onCheckedChange={setRequireServer} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>QR Code Management</CardTitle>
                    <CardDescription>Print or reset QR codes for individual tables or the entire floor.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Button disabled={!isEnabled} variant="outline" className="w-full sm:w-auto text-primary border-primary">
                            Print All Active QR Codes
                        </Button>
                        <Button disabled={!isEnabled} variant="destructive" className="w-full sm:w-auto">
                            Invalidate All Active Sessions
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 mt-8">
                <Button variant="outline">Discard Changes</Button>
                <Button>Save Configuration</Button>
            </div>
        </div>
    );
}
