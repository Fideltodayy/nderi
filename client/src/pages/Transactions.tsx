import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TransactionsTable from "@/components/TransactionsTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, TrendingUp, BookOpen, RotateCcw, AlertCircle, Users } from "lucide-react";
import { startOfDay, startOfWeek, startOfMonth, isAfter } from "date-fns";
import { useTransactions } from "@/hooks/useTransactions";

import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

type DateRange = 'today' | 'week' | 'month' | 'all' | 'custom';
type DateRangeValue = { from: Date; to: Date } | null;

export default function Transactions() {
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [customDateRange, setCustomDateRange] = useState<DateRangeValue>(null);
  
  const { data: transactionsData = [], isLoading } = useTransactions();

  // Handle date range selection - ensure popover closes when date range is changed
  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    if (newRange !== 'custom') {
      setCustomPopoverOpen(false);
    }
  };

  const transactions = useMemo(() => {
    // Check for overdue items
    const now = new Date();
    return transactionsData.map(t => {
      const date = new Date(t.date);
      const dueDate = t.dueDate ? new Date(t.dueDate) : undefined;
      const returnDate = t.returnDate ? new Date(t.returnDate) : undefined;
      
      // Determine if the transaction is overdue
      let status = t.status;
      if (t.action === 'borrow' && status === 'active' && dueDate && now > dueDate) {
        status = 'overdue';
      }
      
      return {
        ...t,
        date,
        dueDate,
        returnDate,
        status,
      };
    });
  }, [transactionsData]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        const today = startOfDay(now);
        return { from: today, to: now };
      case 'week':
        return { from: startOfWeek(now), to: now };
      case 'month':
        return { from: startOfMonth(now), to: now };
      case 'custom':
        if (customDateRange?.from && customDateRange?.to) {
          return customDateRange;
        }
        return { from: new Date(0), to: now };
      case 'all':
      default:
        return { from: new Date(0), to: now };
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = 
        transaction.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.studentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || transaction.status === statusFilter;

      const { from, to } = getDateRange();
      const transactionDate = transaction.date.getTime();
      const matchesDate = transactionDate >= from.getTime() && transactionDate <= to.getTime();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchQuery, statusFilter, dateRange, transactions]);

  const analytics = useMemo(() => {
    const { from, to } = getDateRange();
    const inRangeTransactions = transactions.filter(t => {
      const date = t.date.getTime();
      return date >= from.getTime() && date <= to.getTime();
    });

    const checkouts = inRangeTransactions.filter(t => t.action === 'borrow').length;
    const returns = inRangeTransactions.filter(t => t.action === 'return').length;
    const activeLoans = transactions.filter(t => t.status === 'active').length;
    const overdueItems = transactions.filter(t => t.status === 'overdue').length;

    const bookCounts = inRangeTransactions.reduce((acc, t) => {
      if (t.action === 'borrow') {
        acc[t.bookTitle] = (acc[t.bookTitle] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topBooks = Object.entries(bookCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const studentCounts = inRangeTransactions.reduce((acc, t) => {
      if (t.action === 'borrow') {
        acc[t.studentName] = (acc[t.studentName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const activeStudents = Object.keys(studentCounts).length;

    return {
      checkouts,
      returns,
      activeLoans,
      overdueItems,
      topBooks,
      activeStudents,
    };
  }, [dateRange, transactions]);

  const getDateRangeLabel = () => {
    if (dateRange === 'custom' && customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, 'MMM d, yyyy')} - ${format(customDateRange.to, 'MMM d, yyyy')}`;
    }
    const labels = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      all: 'All Time',
      custom: 'Custom Range',
    };
    return labels[dateRange];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Transaction History & Reports</h2>
          <p className="text-muted-foreground mt-1">View activity and generate summaries</p>
        </div>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-sm text-muted-foreground">Period:</span>
        <Badge 
          variant={dateRange === 'today' ? 'default' : 'outline'} 
          className="cursor-pointer hover-elevate"
          onClick={() => handleDateRangeChange('today')}
          data-testid="period-today"
        >
          <CalendarIcon className="w-3 h-3 mr-1" />
          Today
        </Badge>
        <Badge 
          variant={dateRange === 'week' ? 'default' : 'outline'} 
          className="cursor-pointer hover-elevate"
          onClick={() => handleDateRangeChange('week')}
          data-testid="period-week"
        >
          <CalendarIcon className="w-3 h-3 mr-1" />
          This Week
        </Badge>
        <Badge 
          variant={dateRange === 'month' ? 'default' : 'outline'} 
          className="cursor-pointer hover-elevate"
          onClick={() => handleDateRangeChange('month')}
          data-testid="period-month"
        >
          <CalendarIcon className="w-3 h-3 mr-1" />
          This Month
        </Badge>
        <Badge 
          variant={dateRange === 'all' ? 'default' : 'outline'} 
          className="cursor-pointer hover-elevate"
          onClick={() => handleDateRangeChange('all')}
          data-testid="period-all"
        >
          All Time
        </Badge>
        
        <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap hover-elevate cursor-pointer ${
                dateRange === 'custom' 
                  ? 'border-transparent bg-primary text-primary-foreground shadow-xs' 
                  : 'border [border-color:var(--badge-outline)] shadow-xs'
              }`}
              data-testid="period-custom"
            >
              <CalendarIcon className="w-3 h-3 mr-1" />
              {dateRange === 'custom' && customDateRange?.from && customDateRange?.to
                ? `${format(customDateRange.from, 'MMM d, yyyy')} - ${format(customDateRange.to, 'MMM d, yyyy')}`
                : "Custom Range"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" side="bottom">
            <Calendar
              mode="range"
              selected={customDateRange as any}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setCustomDateRange({
                    from: range.from,
                    to: range.to
                  });
                  setDateRange('custom');
                  setCustomPopoverOpen(false);
                } else if (range?.from) {
                  // Allow partial selection (start date selected, waiting for end date)
                  setCustomDateRange({
                    from: range.from,
                    to: range.from
                  });
                }
              }}
              numberOfMonths={2}
              defaultMonth={new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checkouts</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-checkouts">{analytics.checkouts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getDateRangeLabel()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returns</CardTitle>
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-returns">{analytics.returns}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getDateRangeLabel()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active">{analytics.activeLoans}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently borrowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="stat-overdue">{analytics.overdueItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Borrowed Books</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topBooks.length > 0 ? (
              <div className="space-y-3">
                {analytics.topBooks.map(([title, count], index) => (
                  <div key={title} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-muted-foreground w-4">#{index + 1}</span>
                      <span className="text-sm font-medium">{title}</span>
                    </div>
                    <Badge variant="secondary">{count} checkouts</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data for this period</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Students</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{analytics.activeStudents}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Return Rate</span>
                <span className="text-sm font-semibold">
                  {analytics.checkouts > 0 
                    ? Math.round((analytics.returns / analytics.checkouts) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Net Checkouts</span>
                <span className="text-sm font-semibold">
                  {analytics.checkouts - analytics.returns}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="search"
            placeholder="Search by book or student..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-transactions-search"
          />
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge 
            variant={statusFilter === 'active' ? 'default' : 'outline'} 
            className="cursor-pointer hover-elevate"
            onClick={() => setStatusFilter(statusFilter === 'active' ? null : 'active')}
            data-testid="filter-active"
          >
            Active
          </Badge>
          <Badge 
            variant={statusFilter === 'returned' ? 'default' : 'outline'} 
            className="cursor-pointer hover-elevate"
            onClick={() => setStatusFilter(statusFilter === 'returned' ? null : 'returned')}
            data-testid="filter-returned"
          >
            Returned
          </Badge>
          <Badge 
            variant={statusFilter === 'overdue' ? 'default' : 'outline'} 
            className="cursor-pointer hover-elevate"
            onClick={() => setStatusFilter(statusFilter === 'overdue' ? null : 'overdue')}
            data-testid="filter-overdue"
          >
            Overdue
          </Badge>
          {statusFilter && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setStatusFilter(null)}
              data-testid="button-clear-filter"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground ml-auto">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

  <TransactionsTable transactions={filteredTransactions as any} />
    </div>
  );
}
