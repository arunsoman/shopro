import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { tablesideApi, type TableQrResponse } from '../api/tablesideApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Printer, QrCode, RefreshCcw } from 'lucide-react';

export function TablesideSettingsPage() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [requireServer, setRequireServer] = useState(true);
    const [qrCodes, setQrCodes] = useState<TableQrResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Mock load or initial fetch could go here
        // Initial state is hardcoded in the component for now
    }, []);

    const fetchQrCodes = async () => {
        setIsLoading(true);
        try {
            const data = await tablesideApi.getAllQrCodes();
            setQrCodes(data);
        } catch (error) {
            console.error("Failed to fetch QR codes", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Shopro QR Codes</title>
                    <style>
                        body { font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 20px; padding: 40px; }
                        .qr-item { border: 1px solid #ccc; padding: 20px; text-align: center; width: 200px; }
                        img { width: 100%; height: auto; }
                        .name { font-weight: bold; font-size: 20px; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    ${qrCodes.map(qr => `
                        <div class="qr-item">
                            <div class="name">${qr.tableName}</div>
                            <img src="${qr.qrCodeBase64}" />
                            <div style="font-size: 10px; margin-top: 10px;">tableasist.afriqpay.com</div>
                        </div>
                    `).join('')}
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintSingle = (qr: TableQrResponse) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>QR Code - ${qr.tableName}</title>
                    <style>
                        body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        .qr-card { text-align: center; padding: 40px; border: 2px solid #000; }
                        img { width: 400px; height: 400px; }
                        .name { font-size: 48px; font-weight: bold; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="qr-card">
                        <div class="name">${qr.tableName}</div>
                        <img src="${qr.qrCodeBase64}" />
                        <div style="font-size: 14px; margin-top: 20px;">tableasist.afriqpay.com</div>
                    </div>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="p-8 max-w-5xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tableside Ordering</h2>
                    <p className="text-muted-foreground">Manage QR code and self-serve ordering configurations for your tables.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchQrCodes} disabled={isLoading} variant="outline" size="sm">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                        Refresh List
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <CardTitle>Bulk Actions</CardTitle>
                        <CardDescription>Actions for the entire floor.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                            <Button 
                                disabled={!isEnabled || qrCodes.length === 0} 
                                variant="outline" 
                                className="w-full justify-start text-primary border-primary"
                                onClick={handlePrintAll}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print All Generated QR Codes
                            </Button>
                            <Button disabled={!isEnabled} variant="outline" className="w-full justify-start text-destructive border-destructive border-opacity-50 hover:bg-destructive hover:text-white">
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Invalidate All Active Sessions
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>QR Code Table Management</CardTitle>
                    <CardDescription>View and print tokens for specific tables.</CardDescription>
                </CardHeader>
                <CardContent>
                    {qrCodes.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <QrCode className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <p className="text-muted-foreground mb-4">No QR codes generated yet.</p>
                            <Button onClick={fetchQrCodes} variant="secondary">Generate Codes</Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Table Name</TableHead>
                                        <TableHead>Target URL</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {qrCodes.map((qr) => (
                                        <TableRow key={qr.tableId}>
                                            <TableCell className="font-medium">{qr.tableName}</TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-xs">{qr.targetUrl}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="icon" variant="ghost" onClick={() => handlePrintSingle(qr)}>
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 mt-8">
                <Button variant="outline">Discard Changes</Button>
                <Button>Save Configuration</Button>
            </div>
        </div>
    );
}
