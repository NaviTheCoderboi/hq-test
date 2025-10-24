import {
    CalendarDate,
    type DateValue,
    endOfWeek,
    fromDate,
    getDayOfWeek,
    startOfWeek,
    startOfYear
} from '@internationalized/date';
import { useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import type { Session } from '../utils/store.ts';

interface Props {
    sessions: Session[];
    timeRange: 'weekly' | 'monthly' | 'yearly';
}

const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const daysBetween = (a: DateValue, b: DateValue) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const timeA = new Date(a.year, a.month - 1, a.day).getTime();
    const timeB = new Date(b.year, b.month - 1, b.day).getTime();
    return Math.floor((timeA - timeB) / oneDay);
};

const getWeekOfYear = (date: DateValue, locale = 'en-US') => {
    const yearStart = startOfYear(date);
    const startWeek = startOfWeek(date, locale);
    const startFirstWeek = startOfWeek(yearStart, locale);

    const days = daysBetween(startWeek, startFirstWeek);
    return Math.floor(days / 7) + 1;
};

const getColor = (index: number, total: number): string => {
    const hue = Math.round((index / total) * 360);
    return `hsl(${hue}, 70%, 50%)`;
};

const WeeklyChart = (props: Omit<Props, 'timeRange'>) => {
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [activeSubject, setActiveSubject] = useState<string | null>(null);

    const sessionsByYearWeek = useMemo(() => {
        const weeks: Record<string, Session[]> = {};
        props.sessions.forEach((s) => {
            const date = fromDate(s.startTime, 'UTC');
            const year = date.year;
            const week = getWeekOfYear(date);
            const key = `${year}-W${week}`;
            if (!weeks[key]) weeks[key] = [];
            weeks[key].push(s);
        });
        return weeks;
    }, [props.sessions]);

    const availableYears = Array.from(
        new Set(props.sessions.map((s) => fromDate(s.startTime, 'UTC').year))
    ).sort((a, b) => a - b);

    const currentYear = selectedYear ?? availableYears[availableYears.length - 1];

    const availableWeeks = Object.keys(sessionsByYearWeek)
        .filter((k) => k.startsWith(`${currentYear}-W`))
        .map((k) => Number(k.split('W')[1]))
        .sort((a, b) => a - b);

    const currentWeek = selectedWeek ?? availableWeeks[availableWeeks.length - 1];

    const key = `${currentYear}-W${currentWeek}`;
    const weekSessions = sessionsByYearWeek[key] || [];

    const data = useMemo(() => {
        const result: Record<string, Record<string, number>> = {};
        weekSessions.forEach((s) => {
            const duration = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60 * 60);
            const weekday = getDayOfWeek(
                new CalendarDate(
                    s.startTime.getFullYear(),
                    s.startTime.getMonth() + 1,
                    s.startTime.getDate()
                ),
                'gregory'
            );
            const dayName = weekdayNames[weekday];
            if (!result[dayName]) result[dayName] = {};
            if (!result[dayName][s.subject]) result[dayName][s.subject] = 0;
            result[dayName][s.subject] += duration;
        });

        return weekdayNames.map((d) => ({ day: d, ...result[d] }));
    }, [weekSessions]);

    const subjects = Array.from(new Set(props.sessions.map((s) => s.subject)));

    const sampleDate = fromDate(weekSessions[0]?.startTime ?? new Date(), 'UTC');
    const firstDay = startOfWeek(sampleDate, 'gregory');
    const lastDay = endOfWeek(sampleDate, 'gregory');
    const weekLabel = `${firstDay.month}/${firstDay.day} - ${lastDay.month}/${lastDay.day}`;

    return (
        <div className="w-full max-w-5xl mx-auto p-2">
            <div className="flex justify-end gap-2 mb-2">
                <select
                    value={currentYear}
                    onChange={(e) => {
                        setSelectedYear(Number(e.target.value));
                        setSelectedWeek(null);
                    }}
                    className="bg-zinc-800 text-gray-200 p-1 rounded"
                >
                    {availableYears.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <select
                    value={currentWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="bg-zinc-800 text-gray-200 p-1 rounded"
                >
                    {availableWeeks.map((w) => (
                        <option key={w} value={w}>
                            Week {w}
                        </option>
                    ))}
                </select>
            </div>

            <p className="text-center text-gray-400 py-2">
                Year {currentYear}, Week {currentWeek} ({weekLabel})
            </p>

            <ResponsiveContainer width="100%" height={350}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    style={{ background: '#1e1e1e', borderRadius: 8, padding: 10 }}
                >
                    <XAxis dataKey="day" stroke="#ccc" tick={{ fill: '#ccc' }} />
                    <YAxis
                        label={{
                            value: 'Hours',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#ccc'
                        }}
                        stroke="#ccc"
                        tick={{ fill: '#ccc' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#333', border: 'none' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#aaa' }}
                        cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                    />
                    <Legend
                        wrapperStyle={{ color: '#ccc' }}
                        onMouseEnter={(e) => setActiveSubject(e.dataKey as string)}
                        onMouseLeave={() => setActiveSubject(null)}
                    />

                    {subjects.map((subject, i) => (
                        <Bar
                            key={subject}
                            dataKey={subject}
                            stackId="a"
                            fill={getColor(i, subjects.length)}
                            opacity={activeSubject === null || activeSubject === subject ? 1 : 0.3}
                            className="transition-all duration-200"
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];

const MonthlyChart = (props: Omit<Props, 'timeRange'>) => {
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [activeSubject, setActiveSubject] = useState<string | null>(null);

    const sessionsByMonth = useMemo(() => {
        const months: Record<string, Session[]> = {};
        props.sessions.forEach((s) => {
            const date = fromDate(s.startTime, 'UTC');
            const key = `${date.year}-${String(date.month).padStart(2, '0')}`;
            if (!months[key]) months[key] = [];
            months[key].push(s);
        });
        return months;
    }, [props.sessions]);

    const availableYears = Array.from(
        new Set(props.sessions.map((s) => s.startTime.getFullYear()))
    ).sort((a, b) => a - b);

    const currentYear = selectedYear ?? availableYears[availableYears.length - 1];

    const availableMonths = Object.keys(sessionsByMonth)
        .filter((key) => key.startsWith(currentYear.toString()))
        .sort();

    const currentMonthKey = selectedMonth ?? availableMonths[availableMonths.length - 1];

    const monthSessions = sessionsByMonth[currentMonthKey] || [];
    const [year, month] = currentMonthKey.split('-').map(Number);
    const monthLabel = `${monthNames[month - 1]} ${year}`;

    const data = useMemo(() => {
        const result: Record<string, Record<string, number>> = {};

        monthSessions.forEach((s) => {
            const duration = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60 * 60);
            const date = fromDate(s.startTime, 'UTC');
            const day = date.day.toString();
            if (!result[day]) result[day] = {};
            if (!result[day][s.subject]) result[day][s.subject] = 0;
            result[day][s.subject] += duration;
        });

        const daysInMonth = new Date(year, month, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
            const day = (i + 1).toString();
            return { day, ...result[day] };
        });
    }, [monthSessions, month, year]);

    const subjects = Array.from(new Set(props.sessions.map((s) => s.subject)));

    return (
        <div className="w-full max-w-5xl mx-auto p-2">
            <div className="flex justify-end gap-2 mb-2">
                <select
                    value={currentYear}
                    onChange={(e) => {
                        setSelectedYear(Number(e.target.value));
                        setSelectedMonth(null);
                    }}
                    className="bg-zinc-800 text-gray-200 p-1 rounded"
                >
                    {availableYears.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <select
                    value={currentMonthKey}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-zinc-800 text-gray-200 p-1 rounded"
                >
                    {availableMonths.map((m) => {
                        const [y, mo] = m.split('-').map(Number);
                        return (
                            <option key={m} value={m}>
                                {monthNames[mo - 1]} {y}
                            </option>
                        );
                    })}
                </select>
            </div>

            <p className="text-center text-gray-400 py-2">{monthLabel}</p>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    style={{ background: '#1e1e1e', borderRadius: 8, padding: 10 }}
                >
                    <XAxis dataKey="day" stroke="#ccc" tick={{ fill: '#ccc' }} />
                    <YAxis
                        label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#ccc' }}
                        stroke="#ccc"
                        tick={{ fill: '#ccc' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#333', border: 'none' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#aaa' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.01)' }}
                    />
                    <Legend
                        wrapperStyle={{ color: '#ccc' }}
                        onMouseEnter={(e) => setActiveSubject(e.dataKey as string)}
                        onMouseLeave={() => setActiveSubject(null)}
                    />

                    {subjects.map((subject, i) => {
                        const isActive = activeSubject === null || activeSubject === subject;
                        const color = getColor(i, subjects.length);

                        return (
                            <Line
                                key={subject}
                                type="monotone"
                                dataKey={subject}
                                stroke={color}
                                fill={color}
                                connectNulls
                                strokeOpacity={isActive ? 1 : 0.5}
                                opacity={isActive ? 1 : 0.5}
                                activeDot={{ r: 8 }}
                                dot={{ r: 3 }}
                                className="transition-all duration-200"
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const YearlyChart = (props: Omit<Props, 'timeRange'>) => {
    const [activeSubject, setActiveSubject] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const sessionsByYear = useMemo(() => {
        const years: Record<number, Session[]> = {};
        props.sessions.forEach((s) => {
            const date = fromDate(s.startTime, 'UTC');
            const year = date.year;
            if (!years[year]) years[year] = [];
            years[year].push(s);
        });
        return years;
    }, [props.sessions]);

    const availableYears = Object.keys(sessionsByYear)
        .map(Number)
        .sort((a, b) => a - b);

    const currentYear = selectedYear ?? availableYears[availableYears.length - 1];

    const yearSessions = sessionsByYear[currentYear] || [];

    const data = useMemo(() => {
        const result: Record<string, Record<string, number>> = {};

        yearSessions.forEach((s) => {
            const duration = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60 * 60);
            const date = fromDate(s.startTime, 'UTC');
            const monthName = monthNames[date.month - 1];
            if (!result[monthName]) result[monthName] = {};
            if (!result[monthName][s.subject]) result[monthName][s.subject] = 0;
            result[monthName][s.subject] += duration;
        });

        return monthNames.map((m) => ({ month: m, ...result[m] }));
    }, [yearSessions]);

    const subjects = Array.from(new Set(props.sessions.map((s) => s.subject)));

    return (
        <div className="w-full max-w-5xl mx-auto p-2">
            <div className="flex justify-end">
                <select
                    value={currentYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-zinc-800 text-gray-200 p-1 rounded"
                >
                    {availableYears.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>
            </div>

            <p className="text-center opacity-70 py-2">{currentYear}</p>

            <ResponsiveContainer width="100%" height={350}>
                <ScatterChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    style={{ background: '#1e1e1e', borderRadius: 8, padding: 10 }}
                >
                    <XAxis dataKey="month" stroke="#ccc" tick={{ fill: '#ccc' }} />

                    <YAxis
                        label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#ccc' }}
                        stroke="#ccc"
                        tick={{ fill: '#ccc' }}
                    />

                    <Tooltip
                        contentStyle={{ backgroundColor: '#333', border: 'none' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#aaa' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.01)' }}
                    />

                    <Legend
                        style={{
                            userSelect: 'none'
                        }}
                        wrapperStyle={{ color: '#ccc' }}
                        onMouseEnter={(e) => setActiveSubject(e.dataKey as string)}
                        onMouseLeave={() => setActiveSubject(null)}
                    />

                    {subjects.map((subject, i) => {
                        const isActive = activeSubject === null || activeSubject === subject;
                        const color = getColor(i, subjects.length);

                        return (
                            <Scatter
                                key={subject}
                                name={subject}
                                type="monotone"
                                dataKey={subject}
                                stroke={color}
                                fillOpacity={isActive ? 1 : 0.3}
                                fill={color}
                            />
                        );
                    })}
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

export const StudySessionAnalytics = (props: Props) => {
    const rendered = useMemo(() => {
        switch (props.timeRange) {
            case 'weekly':
                return <WeeklyChart sessions={props.sessions} />;
            case 'monthly':
                return <MonthlyChart sessions={props.sessions} />;
            case 'yearly':
                return <YearlyChart sessions={props.sessions} />;
        }
    }, [props.timeRange, props.sessions]);

    return rendered;
};
