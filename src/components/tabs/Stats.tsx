import { Card, CardHeader, Select, SelectItem } from '@heroui/react';
import { BookOpen, ChartColumn, ChartNoAxesCombined, Clock, Flame } from 'lucide-react';
import { useState } from 'react';
import { type Session, useStudyStore } from '../../utils/store.ts';
import { StudySessionAnalytics } from '../Charts.tsx';

const getTotalStudyTime = (sessions: Session[]) => {
    return sessions.reduce((total, session) => {
        const duration =
            (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
        return total + duration;
    }, 0);
};

const getTotalSessions = (sessions: Session[]) => {
    return sessions.length;
};

const getAverageSessionTime = (sessions: Session[]) => {
    if (sessions.length === 0) return 0;
    const totalTime = getTotalStudyTime(sessions);
    return Math.round(totalTime / sessions.length);
};

const getCurrentStreak = (sessions: Session[]) => {
    const today = new Date();
    let streak = 0;
    let dayOffset = 0;

    while (true) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - dayOffset);
        const hasSession = sessions.some((session) => {
            const sessionDate = new Date(session.startTime);
            return (
                sessionDate.getFullYear() === checkDate.getFullYear() &&
                sessionDate.getMonth() === checkDate.getMonth() &&
                sessionDate.getDate() === checkDate.getDate()
            );
        });
        if (hasSession) {
            streak++;
            dayOffset++;
        } else {
            break;
        }
    }

    return streak;
};

const Stats = () => {
    const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
    const studyState = useStudyStore();

    return (
        <div className="h-full w-full p-6 flex flex-col gap-6 overflow-y-scroll">
            <div className="flex flex-col gap-2">
                <h2 className="text-zinc-100 text-3xl font-medium">Statistics</h2>
                <h3 className="text-zinc-300">Your study progress overview</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <Card className="bg-purple-950/20 border border-purple-900 p-6">
                    <CardHeader className="justify-between">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Clock className="text-purple-400" />
                        </div>
                        <div className="flex flex-col gap-2 justify-center items-end">
                            Total Study Time
                            <div className="text-purple-300">
                                {getTotalStudyTime(studyState.sessions)} hrs
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                <Card className="bg-emerald-950/20 border border-emerald-900 p-6">
                    <CardHeader className="justify-between">
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <BookOpen className="text-emerald-400" />
                        </div>
                        <div className="flex flex-col gap-2 justify-center items-end">
                            Total Sessions
                            <div className="text-emerald-300">
                                {getTotalSessions(studyState.sessions)}
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                <Card className="bg-sky-950/20 border border-sky-900 p-6">
                    <CardHeader className="justify-between">
                        <div className="p-2 bg-sky-500/20 rounded-xl">
                            <ChartNoAxesCombined className="text-sky-400" />
                        </div>
                        <div className="flex flex-col gap-2 justify-center items-end">
                            Average Session
                            <div className="text-sky-300">
                                {getAverageSessionTime(studyState.sessions)} hrs
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                <Card className="bg-rose-950/20 border border-rose-900 p-6">
                    <CardHeader className="justify-between">
                        <div className="p-2 bg-rose-500/20 rounded-xl">
                            <Flame className="text-rose-400" />
                        </div>
                        <div className="flex flex-col gap-2 justify-center items-end">
                            Current Streak
                            <div className="text-rose-300">
                                {getCurrentStreak(studyState.sessions)}
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
            <div className="p-6 rounded-lg border border-zinc-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex justify-center items-center gap-2">
                        <ChartColumn />
                        <h3 className="text-zinc-100 font-medium">
                            {timeRange[0].toUpperCase() + timeRange.slice(1)} Study Analytics
                        </h3>
                    </div>
                    <Select
                        label="Time Range"
                        placeholder="Select a time range"
                        selectionMode="single"
                        size="sm"
                        defaultSelectedKeys={['weekly']}
                        className="max-w-xs"
                        disallowEmptySelection
                        onSelectionChange={(v) => {
                            const value = Array.from(v)[0] as 'weekly' | 'monthly' | 'yearly';
                            setTimeRange(value);
                        }}
                    >
                        <SelectItem key="weekly">Weekly</SelectItem>
                        <SelectItem key="monthly">Monthly</SelectItem>
                        <SelectItem key="yearly">Yearly</SelectItem>
                    </Select>
                </div>
                <StudySessionAnalytics sessions={studyState.sessions} timeRange={timeRange} />
            </div>
        </div>
    );
};

export default Stats;
