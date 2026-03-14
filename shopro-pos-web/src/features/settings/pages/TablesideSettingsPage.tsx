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
    const [allTables, setAllTables] = useState<any[]>([]);
    const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [tables, qrs] = await Promise.all([
                tablesideApi.getTables(),
                tablesideApi.getAllQrCodes()
            ]);
            setAllTables(tables);
            setQrCodes(qrs);
        } catch (error) {
            console.error("Failed to load tableside data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTableSelection = (id: string) => {
        const newSelection = new Set(selectedTableIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedTableIds(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedTableIds.size === allTables.length) {
            setSelectedTableIds(new Set());
        } else {
            setSelectedTableIds(new Set(allTables.map(t => t.id)));
        }
    };

    const handleGenerateSelected = async () => {
        setIsLoading(true);
        try {
            // Sequential generation for now as backend doesn't have bulk POST yet
            // But we'll handle it gracefully in the UI
            for (const tableId of selectedTableIds) {
                await tablesideApi.getQrCode(tableId);
            }
            await loadData(); // Refresh to show new QRs
            setSelectedTableIds(new Set());
        } catch (error) {
            console.error("Failed to generate QR codes", error);
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

    const getQrForTable = (tableId: string) => qrCodes.find(q => q.tableId === tableId);

    return (
        <div className="p-8 max-w-5xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tableside Ordering</h2>
                    <p className="text-muted-foreground">Manage QR code and self-serve ordering configurations for your tables.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadData} disabled={isLoading} variant="outline" size="sm">
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
                        <CardDescription>Actions for selected tables ({selectedTableIds.size}).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                            <Button 
                                disabled={selectedTableIds.size === 0 || isLoading} 
                                className="w-full justify-start"
                                onClick={handleGenerateSelected}
                            >
                                <QrCode className="h-4 w-4 mr-2" />
                                Generate QR Codes for Selected
                            </Button>
                            <Button 
                                disabled={qrCodes.length === 0} 
                                variant="outline" 
                                className="w-full justify-start text-primary border-primary"
                                onClick={handlePrintAll}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print All Generated QR Codes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Floor Plan Tables</CardTitle>
                    <CardDescription>Select tables to generate or print QR tokens.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <input 
                                            type="checkbox" 
                                            onChange={toggleSelectAll}
                                            checked={allTables.length > 0 && selectedTableIds.size === allTables.length}
                                        />
                                    </TableHead>
                                    <TableHead>Table Name</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allTables.map((table) => {
                                    const qr = getQrForTable(table.id);
                                    return (
                                        <TableRow key={table.id}>
                                            <TableCell>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedTableIds.has(table.id)}
                                                    onChange={() => toggleTableSelection(table.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{table.name}</TableCell>
                                            <TableCell>{table.sectionName}</TableCell>
                                            <TableCell>
                                                {qr ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Generated
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                        Not Generated
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {qr ? (
                                                    <Button size="icon" variant="ghost" onClick={() => handlePrintSingle(qr)}>
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button size="icon" variant="ghost" onClick={() => {
                                                        setSelectedTableIds(new Set([table.id]));
                                                        handleGenerateSelected();
                                                    }}>
                                                        <RefreshCcw className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {allTables.length === 0 && !isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No tables found in floor plan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
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
