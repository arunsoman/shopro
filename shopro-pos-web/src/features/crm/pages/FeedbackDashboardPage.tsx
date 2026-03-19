import { useQuery } from "@tanstack/react-query";
import { crmApi } from "../api/crmApi";
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Star, MessageSquare, ThumbsUp, ThumbsDown, User, Calendar 
} from "lucide-react";
import { 
    Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip 
} from "recharts";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function FeedbackDashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["crm", "feedback", "stats"],
        queryFn: () => crmApi.getFeedbackStats()
    });

    const { data: serverStats } = useQuery({
        queryKey: ["crm", "feedback", "server-stats"],
        queryFn: () => crmApi.getServerFeedbackStats()
    });

    if (isLoading) return <div>Loading feedback stats...</div>;

    const sentimentData = [
        { name: "Positive", value: stats?.positiveCount || 0, color: "hsl(var(--success))" },
        { name: "Neutral", value: stats?.neutralCount || 0, color: "hsl(var(--warning))" },
        { name: "Negative", value: stats?.negativeCount || 0, color: "hsl(var(--error))" },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Guest Feedback</h1>
                <p className="text-muted-foreground">Monitor guest satisfaction and response to your service.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Average Rating</CardDescription>
                        <CardTitle className="text-4xl">{stats?.averageRating.toFixed(1)} / 5.0</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star 
                                    key={s} 
                                    className={`h-5 w-5 ${s <= Math.round(stats?.averageRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} 
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Responses</CardDescription>
                        <CardTitle className="text-4xl">{stats?.totalFeedbackCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> Across all platforms
                        </div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Sentiment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={sentimentData}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {sentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <Tooltip />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex justify-between text-[10px] mt-2 text-muted-foreground">
                            <span>Negative: {stats?.negativeCount}</span>
                            <span>Neutral: {stats?.neutralCount}</span>
                            <span>Positive: {stats?.positiveCount}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Feedback</CardTitle>
                        <CardDescription>The latest comments from your guests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentFeedback.map((f) => (
                                <div key={f.id} className="flex gap-4 p-4 rounded-lg border border-border/50 bg-muted/20">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-semibold">{f.customerName}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(f.createdAt), "MMM d, h:mm a")}
                                                    <Badge variant="outline" className="text-[10px] py-0">{f.source}</Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-background px-2 py-1 rounded border shadow-sm">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-bold">{f.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm italic text-muted-foreground py-1">"{f.comments || "No comments provided."}"</p>
                                        <div className="flex justify-end pt-1">
                                            <Badge 
                                                className={`text-[9px] gap-1 ${
                                                    f.sentiment === "POSITIVE" ? "bg-emerald-500" : 
                                                    f.sentiment === "NEGATIVE" ? "bg-rose-500" : "bg-amber-500"
                                                }`}
                                            >
                                                {f.sentiment === "POSITIVE" ? <ThumbsUp className="h-2 w-2" /> : <ThumbsDown className="h-2 w-2" />}
                                                {f.sentiment}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Insights</CardTitle>
                        <CardDescription>AI-generated trends from guest reviews.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-8 text-center border border-dashed rounded-md text-muted-foreground text-sm">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>AI-generated insights will appear here once more feedback is collected.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Performance by Server</CardTitle>
                    <CardDescription>Track guest satisfaction scores across your service staff.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Server Name</TableHead>
                                <TableHead className="text-center">Feedback Count</TableHead>
                                <TableHead className="text-right">Average Rating</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!serverStats || serverStats.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                        No server-specific feedback data available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                serverStats.map((s) => (
                                    <TableRow key={s.serverId}>
                                        <TableCell className="font-medium">{s.serverName}</TableCell>
                                        <TableCell className="text-center">{s.ratingCount}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={`font-bold ${s.averageRating >= 4 ? "text-emerald-600" : s.averageRating <= 2 ? "text-rose-600" : "text-amber-600"}`}>
                                                    {s.averageRating.toFixed(1)}
                                                </span>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star 
                                                            key={star} 
                                                            className={`h-3 w-3 ${star <= Math.round(s.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
