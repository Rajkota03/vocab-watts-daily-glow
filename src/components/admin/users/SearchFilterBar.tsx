
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface SearchFilterBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  planFilter: string;
  setPlanFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  planFilter,
  setPlanFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy
}) => {
  return (
    <Card className="p-4 sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by email or name..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:w-auto">
          <div className="flex items-center gap-2">
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="daily-beginner">Daily Beginner</SelectItem>
                <SelectItem value="daily-intermediate">Daily Intermediate</SelectItem>
                <SelectItem value="daily-advanced">Daily Advanced</SelectItem>
                <SelectItem value="business-beginner">Business Beginner</SelectItem>
                <SelectItem value="business-intermediate">Business Intermediate</SelectItem>
                <SelectItem value="business-advanced">Business Advanced</SelectItem>
                <SelectItem value="exam-toefl">Exam - TOEFL</SelectItem>
                <SelectItem value="exam-ielts">Exam - IELTS</SelectItem>
                <SelectItem value="exam-gre">Exam - GRE</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registration">Registration Date</SelectItem>
                <SelectItem value="last_active">Last Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};
