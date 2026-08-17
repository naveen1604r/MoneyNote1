import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import EmptyState from '../components/common/EmptyState';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

import SearchTabs from '../components/search/SearchTabs';
import FilterPanel from '../components/search/FilterPanel';
import FilterChips from '../components/search/FilterChips';
import SearchResultItem from '../components/search/SearchResultItem';
import SearchPagination from '../components/search/SearchPagination';

import { searchFinance } from '../services/api';
import { Search as SearchIcon, SlidersHorizontal, Trash2, History } from 'lucide-react';

const RECENT_SEARCHES_KEY = 'moneynote_recent_searches';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract Initial State from URL Search Params
  const queryFromUrl = searchParams.get('q') || '';
  const typeFromUrl = searchParams.get('type') || 'all';
  const categoryFromUrl = searchParams.get('category') || '';
  const startDateFromUrl = searchParams.get('startDate') || '';
  const endDateFromUrl = searchParams.get('endDate') || '';
  const minAmountFromUrl = searchParams.get('minAmount') || '';
  const maxAmountFromUrl = searchParams.get('maxAmount') || '';
  const sortFromUrl = searchParams.get('sort') || 'newest';
  const pageFromUrl = parseInt(searchParams.get('page'), 10) || 1;
  const limitFromUrl = parseInt(searchParams.get('limit'), 10) || 20;

  // Local State
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const [activeTab, setActiveTab] = useState(typeFromUrl);

  const [filters, setFilters] = useState({
    category: categoryFromUrl,
    startDate: startDateFromUrl,
    endDate: endDateFromUrl,
    minAmount: minAmountFromUrl,
    maxAmount: maxAmountFromUrl,
    sort: sortFromUrl,
  });

  const [pagination, setPagination] = useState({
    page: pageFromUrl,
    limit: limitFromUrl,
    total: 0,
    totalPages: 1,
  });

  // Response Data States
  const [results, setResults] = useState([]);
  const [counts, setCounts] = useState({ all: 0, income: 0, expense: 0, note: 0, recurring: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Recent Searches History State
  const [recentSearches, setRecentSearches] = useState([]);

  // Toast Alerts
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  // Load Recent Searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch (e) { /* Ignore */ }
  }, []);

  const saveRecentSearch = (term) => {
    if (!term || term.trim() === '') return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((s) => s !== clean)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) { /* Ignore */ }
  };

  const removeRecentSearch = (term) => {
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) { /* Ignore */ }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Sync State to URL Search Params
  const updateUrlParams = useCallback((newQuery, newType, newFilters, newPage, newLimit) => {
    const params = {};
    if (newQuery) params.q = newQuery;
    if (newType && newType !== 'all') params.type = newType;
    if (newFilters.category) params.category = newFilters.category;
    if (newFilters.startDate) params.startDate = newFilters.startDate;
    if (newFilters.endDate) params.endDate = newFilters.endDate;
    if (newFilters.minAmount) params.minAmount = newFilters.minAmount;
    if (newFilters.maxAmount) params.maxAmount = newFilters.maxAmount;
    if (newFilters.sort && newFilters.sort !== 'newest') params.sort = newFilters.sort;
    if (newPage && newPage > 1) params.page = newPage;
    if (newLimit && newLimit !== 20) params.limit = newLimit;

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Execute Search API
  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiParams = {
        q: searchInput.trim(),
        type: activeTab,
        category: filters.category,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        sort: filters.sort,
        page: pagination.page,
        limit: pagination.limit,
      };

      const res = await searchFinance(apiParams);
      if (res.data.success) {
        setResults(res.data.results || []);
        setCounts(res.data.counts || { all: 0, income: 0, expense: 0, note: 0, recurring: 0 });
        setPagination((prev) => ({
          ...prev,
          page: res.data.pagination.page,
          limit: res.data.pagination.limit,
          total: res.data.pagination.total,
          totalPages: res.data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error('Search API error:', error);
      showToast('error', 'Unable to search your finances.');
    } finally {
      setIsLoading(false);
    }
  }, [searchInput, activeTab, filters, pagination.page, pagination.limit]);

  // Debounced input search (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrlParams(searchInput, activeTab, filters, pagination.page, pagination.limit);
      performSearch();
      if (searchInput.trim()) {
        saveRecentSearch(searchInput);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, activeTab, filters, pagination.page, pagination.limit, performSearch, updateUrlParams]);

  // Tab Change Handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Apply Filter Panel Handler
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sort: 'newest',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Remove Single Filter Chip
  const handleRemoveFilter = (key) => {
    const updated = { ...filters };
    if (key === 'category') updated.category = '';
    if (key === 'date') {
      updated.startDate = '';
      updated.endDate = '';
    }
    if (key === 'amount') {
      updated.minAmount = '';
      updated.maxAmount = '';
    }
    if (key === 'sort') updated.sort = 'newest';

    setFilters(updated);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Active filter count
  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.startDate || filters.endDate ? 1 : 0) +
    (filters.minAmount || filters.maxAmount ? 1 : 0) +
    (filters.sort && filters.sort !== 'newest' ? 1 : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Global Search"
        subtitle="Find income, expenses, notes, and recurring transactions."
      />

      {/* Search Bar & Filters Button */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search your finances (e.g. salary, rent, food)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <Button
          variant="outline"
          icon={SlidersHorizontal}
          onClick={() => setIsFilterPanelOpen(true)}
          className="shrink-0"
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {/* Recent Searches History */}
      {recentSearches.length > 0 && !searchInput && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 text-xs">
          <span className="flex items-center gap-1 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
            <History className="w-3.5 h-3.5" /> Recent:
          </span>
          {recentSearches.map((term) => (
            <span
              key={term}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setSearchInput(term)}
            >
              {term}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeRecentSearch(term);
                }}
                className="text-slate-400 hover:text-rose-500"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={clearRecentSearches}
            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 ml-auto"
          >
            Clear History
          </button>
        </div>
      )}

      {/* Search Tabs */}
      <SearchTabs
        activeTab={activeTab}
        counts={counts}
        onTabChange={handleTabChange}
      />

      {/* Active Filter Chips */}
      <FilterChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleResetFilters}
      />

      {/* Results Header / Summary */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            {pagination.total} result{pagination.total === 1 ? '' : 's'} found
            {searchInput.trim() && ` for "${searchInput.trim()}"`}
          </span>
        </div>
      )}

      {/* Search Results List / Loading / Empty States */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLoader type="card" count={4} />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((item) => (
            <SearchResultItem key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      ) : searchInput.trim() || activeFilterCount > 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No results found"
          description="Try a different keyword or adjust your category, date, and amount filters."
          action={
            <Button variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={SearchIcon}
          title="Search your finances"
          description="Find transactions, notes, and recurring payments quickly across all your records."
        />
      )}

      {/* Pagination */}
      <SearchPagination
        pagination={pagination}
        onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
        onLimitChange={(newLimit) => setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }))}
      />

      {/* Advanced Filter Modal */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        activeTab={activeTab}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default Search;
